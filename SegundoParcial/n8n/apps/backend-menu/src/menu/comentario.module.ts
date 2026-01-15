import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { WebhookService } from './webhook.service';
import { Menu } from './menu.entity';
import { Plato } from './plato.entity';
import { CategoriaMenu } from './categoria-menu.entity';
import { Idempotencia } from './idempotencia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Plato, CategoriaMenu, Idempotencia]),
  ],
  controllers: [MenuController],
  providers: [MenuService, WebhookService],
})
export class ComentarioModule {}
