import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacasService } from './vacas.service';
import { VacasResolver } from './vacas.resolver';
import { Vaca } from './vaca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vaca])],
  providers: [VacasService, VacasResolver],
  exports: [VacasService],
})
export class VacasModule {}
