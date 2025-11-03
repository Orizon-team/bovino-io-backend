import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacasService } from './cows.service';
import { VacasResolver } from './cows.resolver';
import { Vaca } from './cow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vaca])],
  providers: [VacasService, VacasResolver],
  exports: [VacasService],
})
export class VacasModule {}
