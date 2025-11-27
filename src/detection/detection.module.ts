import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './detection.entity';
import { DeteccionesService } from './detection.service';
import { DeteccionesResolver } from './detection.resolver';
import { DetectionsController } from './detection.controller';
import { TagsModule } from '../tags/tags.module';
import { DispositivosModule } from '../device_esp32/device_esp32.module';
import { ZoneModule } from '../zone/zone.module';
import { DetectionsIngestService } from './detections-ingest.service';
import { MqttDetectionsListener } from './mqtt-detections.listener';
import { Preferencia } from '../preference/preference.entity';
import { Vaca } from '../cows/cow.entity';
import { VacasModule } from '../cows/cows.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deteccion, Preferencia, Vaca]), TagsModule, DispositivosModule, ZoneModule, VacasModule],
  controllers: [DetectionsController],
  providers: [DeteccionesService, DeteccionesResolver, DetectionsIngestService, MqttDetectionsListener],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
