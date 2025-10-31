import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preferencia } from './preferencia.entity';
import { PreferenciasService } from './preferencias.service';
import { PreferenciasResolver } from './preferencias.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Preferencia])],
  providers: [PreferenciasService, PreferenciasResolver],
  exports: [PreferenciasService],
})
export class PreferenciasModule {}
