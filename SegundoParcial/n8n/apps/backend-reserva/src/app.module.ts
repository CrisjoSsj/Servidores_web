import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServicioModule } from './reserva/servicio.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'better-sqlite3',
        database: 'data/reserva.db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ServicioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
