import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './evento.entity';
import { EventosService } from './eventos.service';
import { EventosResolver } from './eventos.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Evento])],
  providers: [EventosService, EventosResolver],
  exports: [EventosService],
})
export class EventosModule {}
