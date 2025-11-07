import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { CreateDeteccionInput } from './dto/create-detection.input';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';
import { Zone } from '../zone/zone.entity';

@Injectable()
export class DeteccionesService {
  constructor(
    @InjectRepository(Deteccion) private repo: Repository<Deteccion>,
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    @InjectRepository(DispositivoESP32) private deviceRepo: Repository<DispositivoESP32>,
    @InjectRepository(Zone) private zoneRepo: Repository<Zone>,
  ) {}

  async create(input: CreateDeteccionInput): Promise<Deteccion> {
    const d = this.repo.create(input as Partial<Deteccion>);
    return this.repo.save(d);
  }

  async findAll(): Promise<Deteccion[]> {
    return this.repo.find({ relations: ['tag', 'device'] });
  }

  async findOneById(id: number): Promise<Deteccion> {
    const d = await this.repo.findOne({ where: { id }, relations: ['tag', 'device'] });
    if (!d) throw new NotFoundException('Deteccion no encontrada');
    return d;
  }

  /**
   * Process payload sent by a device containing multiple detections.
   * Expected shape (see issue): { device_id, zone_name, timestamp, detections: [...] }
   * Will ensure Zone exists (created if missing), ensure Device exists (created if missing),
   * ensure Tag exists (created if missing using id_tag), and persist Detection rows.
   */
  async processDevicePayload(payload: any): Promise<Deteccion[]> {
    if (!payload || !payload.detections || !Array.isArray(payload.detections)) {
      throw new Error('Invalid payload: missing detections array');
    }

    // ensure zone
    let zone: Zone | null = null;
    if (payload.zone_name) {
      zone = await this.zoneRepo.findOne({ where: { name: payload.zone_name } });
      if (!zone) {
        zone = this.zoneRepo.create({ name: payload.zone_name });
        zone = await this.zoneRepo.save(zone);
      }
    }

    // ensure device: try to find by numeric id; if missing, create a new device and associate zone
    let device: DispositivoESP32 | null = null;
    const deviceIdNum = payload.device_id ? Number(payload.device_id) : undefined;
    if (deviceIdNum) {
      device = await this.deviceRepo.findOne({ where: { id: deviceIdNum }, relations: ['zone'] });
    }
    if (!device) {
      // create a new device record and associate zone if present. Note: this will generate a new id.
      const toCreate: Partial<DispositivoESP32> = {};
      if (zone) toCreate.zone = zone as any;
      if (payload.detections.length > 0 && payload.detections[0].device_location) {
        toCreate.location = payload.detections[0].device_location;
      }
      const created = this.deviceRepo.create(toCreate as Partial<DispositivoESP32>);
      device = await this.deviceRepo.save(created);
    }

    const savedDetections: Deteccion[] = [];

    for (const det of payload.detections) {
      if (!det.tag_id) continue; // skip invalid

      // find or create tag by id_tag field
      const idTagStr = String(det.tag_id);
      let tag = await this.tagRepo.findOne({ where: { id_tag: idTagStr } });
      if (!tag) {
        tag = this.tagRepo.create({ id_tag: idTagStr, current_location: det.device_location ?? null });
        tag = await this.tagRepo.save(tag);
      }

      const d = this.repo.create({
        tag,
        device,
        distance: det.distance,
        rssi: det.rssi,
        is_present: det.is_present !== undefined ? !!det.is_present : true,
        first_seen: det.first_seen ? new Date(Number(det.first_seen) * 1000) : undefined,
        last_seen: det.last_seen ? new Date(Number(det.last_seen) * 1000) : undefined,
      } as Partial<Deteccion>);

      const saved = await this.repo.save(d);
      savedDetections.push(saved);
    }

    return savedDetections;
  }
}
