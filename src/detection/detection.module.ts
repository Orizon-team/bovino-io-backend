import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './detection.entity';
import { DeteccionesService } from './detection.service';
import { DeteccionesResolver } from './detection.resolver';
import { DeteccionesController } from './detection.controller';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';
import { Zone } from '../zone/zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deteccion, Tag, DispositivoESP32, Zone])],
  controllers: [DeteccionesController],
  providers: [DeteccionesService, DeteccionesResolver],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
