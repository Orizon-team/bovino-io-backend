import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './zone.entity';
import { ZoneService } from './zone.service';
import { ZoneResolver } from './zone.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Zone])],
  providers: [ZoneService, ZoneResolver],
  exports: [ZoneService],
})
export class ZoneModule {}
