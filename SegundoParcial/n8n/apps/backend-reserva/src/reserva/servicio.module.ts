import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaController } from './reserva.controller';
import { ReservaService } from './reserva.service';
import { WebhookService } from './webhook.service';
import { Reserva } from './reserva.entity';
import { Mesa } from './mesa.entity';
import { Cliente } from './cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Mesa, Cliente]),
  ],
  controllers: [ReservaController],
  providers: [ReservaService, WebhookService],
})
export class ServicioModule {}
