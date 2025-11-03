import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './event.entity';
import { EventosService } from './event.service';
import { EventosResolver } from './event.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Evento])],
  providers: [EventosService, EventosResolver],
  exports: [EventosService],
})
export class EventosModule {}
