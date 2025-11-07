import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { Zone } from '../zone/zone.entity';
import { DeteccionesService } from './detection.service';
import { TagsService } from '../tags/tags.service';
import { DispositivosService } from '../device_esp32/device_esp32.service';
import { ZoneService } from '../zone/zone.service';

@Controller('detections')
export class DetectionsController {
  constructor(
    private detService: DeteccionesService,
    private tagsService: TagsService,
    private dispositivosService: DispositivosService,
    private zoneService: ZoneService,
    @InjectRepository(Deteccion) private detRepo: Repository<Deteccion>,
  ) {}

  @Post('ingest')
  async ingest(@Body() payload: any) {
    if (!payload || !Array.isArray(payload.detections)) {
      throw new HttpException('Invalid payload, missing detections array', HttpStatus.BAD_REQUEST);
    }

    // find device
    const deviceId = Number(payload.device_id);
    let device;
    try {
      device = await this.dispositivosService.findOneById(deviceId);
    } catch (err) {
      throw new HttpException(`Device ${deviceId} not found`, HttpStatus.NOT_FOUND);
    }

  // optionally find or create zone by name
  let zone: Zone | null = null;
    if (payload.zone_name) {
      zone = await this.zoneService.findByName(payload.zone_name);
      if (!zone) {
        // create a zone with minimal info
        zone = await this.zoneService.create({ name: payload.zone_name } as any);
      }
    }

    const results: Deteccion[] = [];

    for (const item of payload.detections) {
      const tagIdStr = String(item.tag_id);

      let tag = await this.tagsService.findByIdTag(tagIdStr);
      if (!tag) {
        // create minimal tag record
        tag = await this.tagsService.create({ id_tag: tagIdStr, current_location: item.device_location } as any);
      } else {
        // update current_location if provided
        if (item.device_location) {
          tag.current_location = item.device_location;
          await this.tagsService.saveTag(tag);
        }
      }

      const firstSeen = item.first_seen ? new Date(item.first_seen * 1000) : undefined;
      const lastSeen = item.last_seen ? new Date(item.last_seen * 1000) : undefined;

      const newDet = this.detRepo.create({
        tag: { id: tag.id } as any,
        device: { id: device.id } as any,
        distance: item.distance,
        rssi: item.rssi,
        is_present: item.is_present !== undefined ? item.is_present : true,
        first_seen: firstSeen,
        last_seen: lastSeen,
      } as Partial<Deteccion>);

      const saved = await this.detRepo.save(newDet);
      results.push(saved);
    }

    return { count: results.length, detections: results };
  }
}
