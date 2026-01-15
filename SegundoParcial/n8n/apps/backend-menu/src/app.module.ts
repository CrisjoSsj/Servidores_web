import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentarioModule } from './menu/comentario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'better-sqlite3',
        database: 'data/menu.db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ComentarioModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
