import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { TagsService } from '../tags/tags.service';
import { DispositivosService } from '../device_esp32/device_esp32.service';
import { ZoneService } from '../zone/zone.service';
import { Zone } from '../zone/zone.entity';

@Injectable()
export class DetectionsIngestService {
  private readonly logger = new Logger(DetectionsIngestService.name);

  constructor(
    @InjectRepository(Deteccion) private readonly detRepo: Repository<Deteccion>,
    private readonly tagsService: TagsService,
    private readonly dispositivosService: DispositivosService,
    private readonly zoneService: ZoneService,
  ) {}

  async processPayload(payload: any) {
    if (!payload || !Array.isArray(payload.detections)) {
      throw new BadRequestException('Invalid payload, missing detections array');
    }

    const deviceId = Number(payload.device_id ?? payload.deviceId);
    if (!deviceId || Number.isNaN(deviceId)) {
      throw new BadRequestException('Invalid payload, missing device_id');
    }

    let device;
    try {
      device = await this.dispositivosService.findOneById(deviceId);
    } catch (err) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    let zone: Zone | null = null;
    const zoneName = payload.zone_name ?? payload.zoneName;
    if (zoneName) {
      zone = await this.zoneService.findByName(zoneName);
      if (!zone) {
        zone = await this.zoneService.create({ name: zoneName } as any);
        this.logger.log(`Created zone "${zoneName}" while processing MQTT payload.`);
      }
      if (zone && (!device.zone || device.zone.id !== zone.id)) {
        try {
          await this.dispositivosService.update(device.id, { id_zona: zone.id } as any);
        } catch (err) {
          this.logger.warn(`Failed to associate device ${device.id} with zone ${zone.id}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }

    const results: Deteccion[] = [];

    for (const item of payload.detections) {
      const tagIdStr = String(item.tag_id ?? item.tagId ?? '');
      if (!tagIdStr) {
        this.logger.warn('Skipping detection without tag_id');
        continue;
      }

      let tag = await this.tagsService.findByIdTag(tagIdStr);
      if (!tag) {
        tag = await this.tagsService.create({ id_tag: tagIdStr, current_location: item.device_location ?? item.deviceLocation } as any);
        this.logger.log(`Created tag ${tagIdStr} from ingest payload.`);
      } else if (item.device_location ?? item.deviceLocation) {
        tag.current_location = item.device_location ?? item.deviceLocation;
        await this.tagsService.saveTag(tag);
      }

      const firstSeenValue = item.first_seen ?? item.firstSeen;
      const lastSeenValue = item.last_seen ?? item.lastSeen;

      const firstSeen = this.toDate(firstSeenValue);
      const lastSeen = this.toDate(lastSeenValue);

      const distance = item.distance ?? item.distancia;
      const rssi = item.rssi ?? item.intensidad_senal ?? item.intensidadSenal;
      const isPresent = (item.is_present ?? item.presente ?? true) as boolean;

      const newDet = this.detRepo.create({
        tag: { id: tag.id } as any,
        device: { id: device.id } as any,
        distance,
        rssi,
        is_present: isPresent,
        first_seen: firstSeen ?? undefined,
        last_seen: lastSeen ?? undefined,
      } as Partial<Deteccion>);

      const saved = await this.detRepo.save(newDet);
      results.push(saved);
    }

    return { count: results.length, detections: results };
  }

  private toDate(value: any): Date | null {
    if (value === undefined || value === null) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      const millis = value > 1e12 ? value : value * 1000;
      const date = new Date(millis);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}