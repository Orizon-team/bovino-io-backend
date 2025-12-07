import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacasService } from './cows.service';
import { VacasResolver } from './cows.resolver';
import { VacasController } from './cows.controller';
import { Vaca } from './cow.entity';
import { Deteccion } from '../detection/detection.entity';
import { Tag } from '../tags/tag.entity';
import { CowRealtimeService } from './cow-realtime.service';
import { CowRealtimeGateway } from './cow-realtime.gateway';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vaca, Deteccion, Tag]), TagsModule],
  controllers: [VacasController],
  providers: [VacasService, VacasResolver, CowRealtimeService, CowRealtimeGateway],
  exports: [VacasService, CowRealtimeService, CowRealtimeGateway],
})
export class VacasModule {}
