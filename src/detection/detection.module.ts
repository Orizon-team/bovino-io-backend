import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deteccion } from './detection.entity';
import { DeteccionesService } from './detection.service';
import { DeteccionesResolver } from './detection.resolver';
import { DetectionsController } from './detection.controller';
import { TagsModule } from '../tags/tags.module';
import { DispositivosModule } from '../device_esp32/device_esp32.module';
import { ZoneModule } from '../zone/zone.module';
import { EventosModule } from '../event/event.module';
import { DetectionsIngestService } from './detections-ingest.service';
import { DetectionCleanupService } from './detection-cleanup.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MqttDetectionsListener } from './mqtt-detections.listener';
import { Preferencia } from '../preference/preference.entity';
import { Vaca } from '../cows/cow.entity';
import { VacasModule } from '../cows/cows.module';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Deteccion, Preferencia, Vaca]), TagsModule, DispositivosModule, ZoneModule, VacasModule, EventosModule],
  controllers: [DetectionsController],
  providers: [DeteccionesService, DeteccionesResolver, DetectionsIngestService, MqttDetectionsListener, DetectionCleanupService],
  exports: [DeteccionesService],
})
export class DeteccionesModule {}
