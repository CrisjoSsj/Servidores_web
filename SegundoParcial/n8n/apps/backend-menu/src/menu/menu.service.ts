import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { Plato } from './plato.entity';
import { CategoriaMenu } from './categoria-menu.entity';
import { Idempotencia } from './idempotencia.entity';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';

@Injectable()
export class MenuService {
  private reservaClient: ClientProxy;

  constructor(
    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,
    @InjectRepository(Plato)
    private platoRepo: Repository<Plato>,
    @InjectRepository(CategoriaMenu)
    private categoriaRepo: Repository<CategoriaMenu>,
    @InjectRepository(Idempotencia)
    private idemRepo: Repository<Idempotencia>,
    private config: ConfigService,
    private webhookService: WebhookService,
  ) {
    this.reservaClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.config.get('RABBITMQ_URL')],
        queue: this.config.get('RABBITMQ_QUEUE_RESERVA'),
        queueOptions: { durable: true },
      },
    });
  }

  // Idempotencia
  async esDuplicado(key: string): Promise<boolean> {
    const existe = await this.idemRepo.findOne({
      where: { idempotency_key: key },
    });
    return !!existe;
  }

  async guardarClave(key: string) {
    const idem = this.idemRepo.create({
      idempotency_key: key,
      procesado_en: new Date().toISOString(),
    });
    await this.idemRepo.save(idem);
  }

  // Validar reserva en ReservaMS
  async validarReserva(reserva_id: number): Promise<{ reserva_id: number; existe: boolean }> {
    return this.reservaClient
      .send('reserva.validar', { reserva_id })
      .toPromise();
  }

  // Crear plato + evento + webhook
  async crearPlato(data: any): Promise<any> {
    // Idempotencia
    if (await this.esDuplicado(data.idempotency_key)) {
      return { mensaje: 'Plato ignorado (duplicado)' };
    }

    // Validar que el menú existe
    const menu = await this.menuRepo.findOne({ where: { id_menu: data.id_menu } });
    if (!menu) {
      throw new BadRequestException(`El menú ${data.id_menu} no existe`);
    }

    // Validar que la categoría existe
    const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: data.id_categoria } });
    if (!categoria) {
      throw new BadRequestException(`La categoría ${data.id_categoria} no existe`);
    }

    // Guardar plato
    const plato = this.platoRepo.create(data as Partial<Plato>);
    const platoGuardado = await this.platoRepo.save(plato);

    // Registrar idempotencia
    await this.guardarClave(data.idempotency_key);

    // Evento interno (RabbitMQ)
    await this.reservaClient.emit('plato.creado', {
      plato_id: platoGuardado.id_plato,
      ...data,
    });

    // Emitir evento a n8n
    await this.webhookService.emitEvent(
      'plato.creado',
      {
        plato_id: platoGuardado.id_plato,
        nombre: platoGuardado.nombre,
        descripcion: platoGuardado.descripcion,
        precio: platoGuardado.precio,
        disponible: platoGuardado.disponible,
        id_menu: platoGuardado.id_menu,
        id_categoria: platoGuardado.id_categoria,
      },
      data.idempotency_key,
      );

    return platoGuardado;
  }

  // Gestión de Menús
  async crearMenu(data: Partial<Menu>) {
    if (!data.fecha) {
      throw new BadRequestException('El campo fecha es obligatorio');
    }
    const menu = this.menuRepo.create(data);
    return this.menuRepo.save(menu);
  }

  async obtenerMenus() {
    return this.menuRepo.find({ relations: ['platos'] });
  }

  async obtenerMenuPorId(id: number) {
    return this.menuRepo.findOne({ 
      where: { id_menu: id },
      relations: ['platos', 'platos.categoria']
    });
  }

  async actualizarMenu(id: number, data: Partial<Menu>) {
    const menu = await this.menuRepo.findOne({ where: { id_menu: id } });
    if (!menu) {
      throw new BadRequestException(`El menú ${id} no existe`);
    }

    Object.assign(menu, {
      fecha: data.fecha ?? menu.fecha,
    });

    return this.menuRepo.save(menu);
  }

  async eliminarMenu(id: number) {
    const menu = await this.menuRepo.findOne({ where: { id_menu: id } });
    if (!menu) {
      throw new BadRequestException(`El menú ${id} no existe`);
    }

    // Validar que no haya platos asociados
    const platosAsociados = await this.platoRepo.count({
      where: { id_menu: id },
    });

    if (platosAsociados > 0) {
      throw new BadRequestException(
        `No se puede eliminar el menú ${id} porque tiene platos asociados`,
      );
    }

    await this.menuRepo.remove(menu);
    return { mensaje: `Menú ${id} eliminado correctamente` };
  }

  // Queries de Platos
  async listarPlatos() {
    return this.platoRepo.find({ relations: ['categoria', 'menu'] });
  }

  async obtenerPlatoPorId(id: number) {
    return this.platoRepo.findOne({ 
      where: { id_plato: id },
      relations: ['categoria', 'menu']
    });
  }

  async listarPlatosPorMenu(menu_id: number) {
    return this.platoRepo.find({ 
      where: { id_menu: menu_id },
      relations: ['categoria']
    });
  }

  async actualizarPlato(id: number, data: Partial<Plato>) {
    const plato = await this.platoRepo.findOne({ where: { id_plato: id } });
    if (!plato) {
      throw new BadRequestException(`El plato ${id} no existe`);
    }

    // Validar menú si cambia
    if (data.id_menu && data.id_menu !== plato.id_menu) {
      const menu = await this.menuRepo.findOne({ where: { id_menu: data.id_menu } });
      if (!menu) {
        throw new BadRequestException(`El menú ${data.id_menu} no existe`);
      }
    }

    // Validar categoría si cambia
    if (data.id_categoria && data.id_categoria !== plato.id_categoria) {
      const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: data.id_categoria } });
      if (!categoria) {
        throw new BadRequestException(`La categoría ${data.id_categoria} no existe`);
      }
    }

    Object.assign(plato, {
      nombre: data.nombre ?? plato.nombre,
      descripcion: data.descripcion ?? plato.descripcion,
      precio: data.precio ?? plato.precio,
      disponible: data.disponible !== undefined ? data.disponible : plato.disponible,
      id_menu: data.id_menu ?? plato.id_menu,
      id_categoria: data.id_categoria ?? plato.id_categoria,
    });

    const platoActualizado = await this.platoRepo.save(plato);

    // Emitir evento de actualización
    await this.webhookService.emitEvent(
      'plato.actualizado',
      {
        plato_id: platoActualizado.id_plato,
        nombre: platoActualizado.nombre,
        descripcion: platoActualizado.descripcion,
        precio: platoActualizado.precio,
        disponible: platoActualizado.disponible,
        id_menu: platoActualizado.id_menu,
        id_categoria: platoActualizado.id_categoria,
      },
      `plato-${platoActualizado.id_plato}-actualizado-${Date.now()}`,
    );

    return platoActualizado;
  }

  async eliminarPlato(id: number) {
    const plato = await this.platoRepo.findOne({ where: { id_plato: id } });
    if (!plato) {
      throw new BadRequestException(`El plato ${id} no existe`);
    }

    // Emitir evento de eliminación antes de eliminar
    await this.webhookService.emitEvent(
      'plato.eliminado',
      {
        plato_id: plato.id_plato,
        nombre: plato.nombre,
        descripcion: plato.descripcion,
        precio: plato.precio,
        disponible: plato.disponible,
        id_menu: plato.id_menu,
        id_categoria: plato.id_categoria,
      },
      `plato-${id}-eliminado-${Date.now()}`,
    );

    await this.platoRepo.remove(plato);
    return { mensaje: `Plato ${id} eliminado correctamente` };
  }

  // Gestión de Categorías
  async crearCategoria(data: Partial<CategoriaMenu>) {
    if (!data.nombre) {
      throw new BadRequestException('El campo nombre es obligatorio');
    }
    const categoria = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(categoria);
  }

  async obtenerCategorias() {
    return this.categoriaRepo.find();
  }

  async obtenerCategoriaPorId(id: number) {
    return this.categoriaRepo.findOne({ where: { id_categoria: id } });
  }

  async actualizarCategoria(id: number, data: Partial<CategoriaMenu>) {
    const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: id } });
    if (!categoria) {
      throw new BadRequestException(`La categoría ${id} no existe`);
    }

    Object.assign(categoria, {
      nombre: data.nombre ?? categoria.nombre,
    });

    return this.categoriaRepo.save(categoria);
  }

  async eliminarCategoria(id: number) {
    const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: id } });
    if (!categoria) {
      throw new BadRequestException(`La categoría ${id} no existe`);
    }

    // Validar que no haya platos asociados
    const platosAsociados = await this.platoRepo.count({
      where: { id_categoria: id },
    });

    if (platosAsociados > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría ${id} porque tiene platos asociados`,
      );
    }

    await this.categoriaRepo.remove(categoria);
    return { mensaje: `Categoría ${id} eliminada correctamente` };
  }
}

