import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './detection.entity';
import { DeteccionesService } from './detection.service';
import { DeteccionesResolver } from './detection.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Deteccion])],
  providers: [DeteccionesService, DeteccionesResolver],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
