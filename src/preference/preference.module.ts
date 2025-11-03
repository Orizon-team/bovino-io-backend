import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preferencia } from './preference.entity';
import { PreferenciasService } from './preference.service';
import { PreferenciasResolver } from './preference.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Preferencia])],
  providers: [PreferenciasService, PreferenciasResolver],
  exports: [PreferenciasService],
})
export class PreferenciasModule {}
