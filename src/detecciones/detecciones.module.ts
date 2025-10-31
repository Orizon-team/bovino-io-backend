import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './deteccion.entity';
import { DeteccionesService } from './detecciones.service';
import { DeteccionesResolver } from './detecciones.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Deteccion])],
  providers: [DeteccionesService, DeteccionesResolver],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
