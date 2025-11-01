import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './zona.entity';
import { ZonaService } from './zona.service';
import { ZonaResolver } from './zona.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Zona])],
  providers: [ZonaService, ZonaResolver],
  exports: [ZonaService],
})
export class ZonaModule {}
