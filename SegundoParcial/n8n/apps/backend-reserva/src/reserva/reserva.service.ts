import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reserva.entity';
import { Mesa } from './mesa.entity';
import { Cliente } from './cliente.entity';
import { WebhookService } from './webhook.service';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepo: Repository<Reserva>,
    @InjectRepository(Mesa)
    private mesaRepo: Repository<Mesa>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    private webhookService: WebhookService,
  ) {}

  // Verificar si existe reserva
  async existeReserva(id: number): Promise<boolean> {
    const count = await this.reservaRepo.count({ where: { id_reserva: id } });
    return count > 0;
  }

  // Verificar si existe mesa
  async existeMesa(id: number): Promise<boolean> {
    const count = await this.mesaRepo.count({ where: { id_mesa: id } });
    return count > 0;
  }

  // Verificar si existe cliente
  async existeCliente(id: number): Promise<boolean> {
    const count = await this.clienteRepo.count({ where: { id_cliente: id } });
    return count > 0;
  }

  // Crear reserva + webhook
  async crearReserva(data: Partial<Reserva>) {
    if (!data.id_cliente || !data.id_mesa || !data.fecha) {
      throw new BadRequestException('Los campos id_cliente, id_mesa y fecha son obligatorios');
    }

    // Validar que la mesa existe y está disponible
    const mesa = await this.mesaRepo.findOne({ where: { id_mesa: data.id_mesa } });
    if (!mesa) {
      throw new BadRequestException(`La mesa ${data.id_mesa} no existe`);
    }
    if (mesa.estado !== 'disponible') {
      throw new BadRequestException(`La mesa ${data.id_mesa} no está disponible`);
    }

    // Validar que el cliente existe
    const cliente = await this.clienteRepo.findOne({ where: { id_cliente: data.id_cliente } });
    if (!cliente) {
      throw new BadRequestException(`El cliente ${data.id_cliente} no existe`);
    }

    // Establecer estado por defecto
    if (!data.estado) {
      data.estado = 'pendiente';
    }

    // Guardar reserva
    const reserva = this.reservaRepo.create(data);
    const reservaGuardada = await this.reservaRepo.save(reserva);

    // Actualizar estado de la mesa
    mesa.estado = 'reservada';
    await this.mesaRepo.save(mesa);

    // Emitir evento de reserva creada
    await this.webhookService.emitEvent(
      'reserva.creada',
      {
        reserva_id: reservaGuardada.id_reserva,
        id_cliente: reservaGuardada.id_cliente,
        id_mesa: reservaGuardada.id_mesa,
        fecha: reservaGuardada.fecha,
        hora_inicio: reservaGuardada.hora_inicio,
        hora_fin: reservaGuardada.hora_fin,
        estado: reservaGuardada.estado,
      },
      `reserva-${reservaGuardada.id_reserva}-creada`,
      );

    return reservaGuardada;
  }

  async obtenerReservas() {
    return this.reservaRepo.find();
  }

  async obtenerReservaPorId(id: number) {
    return this.reservaRepo.findOne({ where: { id_reserva: id } });
  }

  async actualizarReserva(id: number, data: Partial<Reserva>) {
    const reserva = await this.reservaRepo.findOne({ where: { id_reserva: id } });
    if (!reserva) {
      throw new BadRequestException(`La reserva ${id} no existe`);
    }

    // Si cambia id_mesa, validar disponibilidad
    if (data.id_mesa && data.id_mesa !== reserva.id_mesa) {
      const nuevaMesa = await this.mesaRepo.findOne({ where: { id_mesa: data.id_mesa } });
      if (!nuevaMesa) {
        throw new BadRequestException(`La mesa ${data.id_mesa} no existe`);
      }
      if (nuevaMesa.estado !== 'disponible') {
        throw new BadRequestException(`La mesa ${data.id_mesa} no está disponible`);
      }

      // Liberar mesa anterior
      const mesaAnterior = await this.mesaRepo.findOne({ where: { id_mesa: reserva.id_mesa } });
      if (mesaAnterior) {
        mesaAnterior.estado = 'disponible';
        await this.mesaRepo.save(mesaAnterior);
      }

      // Reservar nueva mesa
      nuevaMesa.estado = 'reservada';
      await this.mesaRepo.save(nuevaMesa);
    }

    // Guardar estado anterior para detectar cambios
    const estadoAnterior = reserva.estado;

    // Actualizar campos permitidos
    Object.assign(reserva, {
      fecha: data.fecha ?? reserva.fecha,
      hora_inicio: data.hora_inicio ?? reserva.hora_inicio,
      hora_fin: data.hora_fin ?? reserva.hora_fin,
      estado: data.estado ?? reserva.estado,
      id_mesa: data.id_mesa ?? reserva.id_mesa,
      id_cliente: data.id_cliente ?? reserva.id_cliente,
    });

    const reservaActualizada = await this.reservaRepo.save(reserva);

    // Emitir eventos según cambio de estado
    if (data.estado && data.estado !== estadoAnterior) {
      const eventType = this.getEventTypeForEstado(data.estado);
      if (eventType) {
        await this.webhookService.emitEvent(
          eventType,
          {
            reserva_id: reservaActualizada.id_reserva,
            id_cliente: reservaActualizada.id_cliente,
            id_mesa: reservaActualizada.id_mesa,
            fecha: reservaActualizada.fecha,
            hora_inicio: reservaActualizada.hora_inicio,
            hora_fin: reservaActualizada.hora_fin,
            estado: reservaActualizada.estado,
            estado_anterior: estadoAnterior,
          },
          `reserva-${reservaActualizada.id_reserva}-${eventType}-${Date.now()}`,
        );
      }
    }

    return reservaActualizada;
  }

  async eliminarReserva(id: number) {
    const reserva = await this.reservaRepo.findOne({ where: { id_reserva: id } });
    if (!reserva) {
      throw new BadRequestException(`La reserva ${id} no existe`);
    }

    // Si la reserva está activa, liberar la mesa
    if (reserva.estado === 'pendiente' || reserva.estado === 'confirmada') {
      const mesa = await this.mesaRepo.findOne({ where: { id_mesa: reserva.id_mesa } });
      if (mesa) {
        mesa.estado = 'disponible';
        await this.mesaRepo.save(mesa);
      }
    }

    // Emitir evento de cancelación antes de eliminar
    await this.webhookService.emitEvent(
      'reserva.cancelada',
      {
        reserva_id: reserva.id_reserva,
        id_cliente: reserva.id_cliente,
        id_mesa: reserva.id_mesa,
        fecha: reserva.fecha,
        hora_inicio: reserva.hora_inicio,
        hora_fin: reserva.hora_fin,
        estado: reserva.estado,
        motivo: 'eliminacion',
      },
      `reserva-${id}-cancelada-${Date.now()}`,
    );

    await this.reservaRepo.remove(reserva);
    return { mensaje: `Reserva ${id} eliminada correctamente` };
  }

  /**
   * Obtiene el tipo de evento según el estado de la reserva
   */
  private getEventTypeForEstado(estado: string): string | null {
    switch (estado) {
      case 'confirmada':
        return 'reserva.confirmada';
      case 'cancelada':
        return 'reserva.cancelada';
      case 'completada':
        return 'checkin.realizado';
      default:
        return null;
    }
  }

  // Gestión de Mesas
  async crearMesa(data: Partial<Mesa>) {
    if (!data.numero || !data.capacidad) {
      throw new BadRequestException('Los campos numero y capacidad son obligatorios');
    }
    if (!data.estado) {
      data.estado = 'disponible';
    }
    const mesa = this.mesaRepo.create(data);
    return this.mesaRepo.save(mesa);
  }

  async obtenerMesas() {
    return this.mesaRepo.find();
  }

  async obtenerMesaPorId(id: number) {
    return this.mesaRepo.findOne({ where: { id_mesa: id } });
  }

  async actualizarMesa(id: number, data: Partial<Mesa>) {
    const mesa = await this.mesaRepo.findOne({ where: { id_mesa: id } });
    if (!mesa) {
      throw new BadRequestException(`La mesa ${id} no existe`);
    }

    Object.assign(mesa, {
      numero: data.numero ?? mesa.numero,
      capacidad: data.capacidad ?? mesa.capacidad,
      estado: data.estado ?? mesa.estado,
    });

    return this.mesaRepo.save(mesa);
  }

  async eliminarMesa(id: number) {
    const mesa = await this.mesaRepo.findOne({ where: { id_mesa: id } });
    if (!mesa) {
      throw new BadRequestException(`La mesa ${id} no existe`);
    }

    // Validar que no haya reservas activas asociadas
    const reservasActivas = await this.reservaRepo.count({
      where: {
        id_mesa: id,
        estado: 'pendiente',
      },
    });

    if (reservasActivas > 0) {
      throw new BadRequestException(
        `No se puede eliminar la mesa ${id} porque tiene reservas activas`,
      );
    }

    await this.mesaRepo.remove(mesa);
    return { mensaje: `Mesa ${id} eliminada correctamente` };
  }

  // Gestión de Clientes
  async crearCliente(data: Partial<Cliente>) {
    if (!data.nombre || !data.correo || !data.telefono) {
      throw new BadRequestException('Los campos nombre, correo y telefono son obligatorios');
    }
    const cliente = this.clienteRepo.create(data);
    return this.clienteRepo.save(cliente);
  }

  async obtenerClientes() {
    return this.clienteRepo.find();
  }

  async obtenerClientePorId(id: number) {
    return this.clienteRepo.findOne({ where: { id_cliente: id } });
  }

  async actualizarCliente(id: number, data: Partial<Cliente>) {
    const cliente = await this.clienteRepo.findOne({ where: { id_cliente: id } });
    if (!cliente) {
      throw new BadRequestException(`El cliente ${id} no existe`);
    }

    Object.assign(cliente, {
      nombre: data.nombre ?? cliente.nombre,
      correo: data.correo ?? cliente.correo,
      telefono: data.telefono ?? cliente.telefono,
    });

    return this.clienteRepo.save(cliente);
  }

  async eliminarCliente(id: number) {
    const cliente = await this.clienteRepo.findOne({ where: { id_cliente: id } });
    if (!cliente) {
      throw new BadRequestException(`El cliente ${id} no existe`);
    }

    // Validar que no haya reservas asociadas
    const reservasAsociadas = await this.reservaRepo.count({
      where: { id_cliente: id },
    });

    if (reservasAsociadas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el cliente ${id} porque tiene reservas asociadas`,
      );
    }

    await this.clienteRepo.remove(cliente);
    return { mensaje: `Cliente ${id} eliminado correctamente` };
  }
}

