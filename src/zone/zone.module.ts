import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './zone.entity';
import { ZonaService } from './zone.service';
import { ZonaResolver } from './zone.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Zona])],
  providers: [ZonaService, ZonaResolver],
  exports: [ZonaService],
})
export class ZonaModule {}
