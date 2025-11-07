import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './detection.entity';
import { DeteccionesService } from './detection.service';
import { DeteccionesResolver } from './detection.resolver';
import { DetectionsController } from './detection.controller';
import { TagsModule } from '../tags/tags.module';
import { DispositivosModule } from '../device_esp32/device_esp32.module';
import { ZoneModule } from '../zone/zone.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deteccion]), TagsModule, DispositivosModule, ZoneModule],
  controllers: [DetectionsController],
  providers: [DeteccionesService, DeteccionesResolver],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
