import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { TagsService } from '../tags/tags.service';
import { DispositivosService } from '../device_esp32/device_esp32.service';
import { ZoneService } from '../zone/zone.service';
import { Zone } from '../zone/zone.entity';
import { Preferencia } from '../preference/preference.entity';
import { Vaca } from '../cows/cow.entity';

@Injectable()
export class DetectionsIngestService {
  private readonly logger = new Logger(DetectionsIngestService.name);

  constructor(
    @InjectRepository(Deteccion) private readonly detRepo: Repository<Deteccion>,
    @InjectRepository(Preferencia) private readonly prefRepo: Repository<Preferencia>,
    @InjectRepository(Vaca) private readonly cowsRepo: Repository<Vaca>,
    private readonly tagsService: TagsService,
    private readonly dispositivosService: DispositivosService,
    private readonly zoneService: ZoneService,
  ) {}

  async processPayload(payload: any) {
    if (!payload || !Array.isArray(payload.detections)) {
      throw new BadRequestException('Invalid payload, missing detections array');
    }

    let device;
    const macAddress = this.extractMacAddress(payload);

    if (macAddress) {
      try {
        device = await this.dispositivosService.findOneByMac(macAddress);
      } catch (err) {
        if (err instanceof NotFoundException) {
          this.logger.warn(`Device with MAC ${macAddress} not found; falling back to device_id lookup.`);
        } else {
          throw err;
        }
      }
    }

    if (!device) {
      const deviceId = this.extractDeviceId(payload);
      if (!deviceId) {
        const inspected = this.describePayload(payload);
        this.logger.warn(`Discarding ingest payload without device identifier. Observed structure: ${inspected}`);
        throw new BadRequestException('Invalid payload, missing device identifier');
      }

      try {
        device = await this.dispositivosService.findOneById(deviceId);
      } catch (err) {
        throw new NotFoundException(`Device ${deviceId} not found`);
      }
    }

    let zone: Zone | null = null;
    const zoneName =
      payload.zone_name ??
      payload.zoneName ??
      payload.device?.zone_name ??
      payload.device?.zoneName ??
      payload.device?.zone;
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
      const visitTimestamp = saved.last_seen ?? lastSeen ?? firstSeen ?? new Date();
      try {
        await this.handlePreferenceUpdate(tag.id, zone ?? device.zone ?? null, visitTimestamp);
      } catch (prefError) {
        this.logger.warn(`Failed to update preference for tag ${tagIdStr}: ${prefError instanceof Error ? prefError.message : prefError}`);
      }
      results.push(saved);
    }

    return { count: results.length, detections: results };
  }

  private async handlePreferenceUpdate(tagId: number, zone: Zone | null, visitDate: Date) {
    if (!visitDate || Number.isNaN(visitDate.getTime())) {
      visitDate = new Date();
    }

    const cow = await this.cowsRepo.findOne({ where: { tag: { id: tagId } }, relations: ['tag'] });
    if (!cow) {
      return;
    }

    if (!zone) {
      this.logger.warn(`Skipping preference update for cow ${cow.id} because device zone is missing.`);
      return;
    }

    const zoneId = zone.id;

    let preference: Preferencia | null = null;
    preference = await this.prefRepo.findOne({ where: { cow: { id: cow.id }, zone: { id: zoneId } }, relations: ['cow', 'zone'] });

    if (!preference) {
      const newPref = this.prefRepo.create({
        cow,
        zone,
        visit_count: 1,
        last_visit: visitDate,
      });
      await this.prefRepo.save(newPref);
      return;
    }

    preference.visit_count = (preference.visit_count ?? 0) + 1;
    preference.last_visit = visitDate;
    await this.prefRepo.save(preference);
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

  private extractDeviceId(payload: any): number | null {
    const candidates: any[] = [
      payload?.device_id,
      payload?.deviceId,
      payload?.DeviceID,
      payload?.deviceid,
      payload?.device?.id,
      payload?.device?.device_id,
      payload?.device?.deviceId,
      payload?.device?.DeviceID,
      payload?.device?.deviceid,
      payload?.reader_id,
      payload?.readerId,
      payload?.gateway_id,
      payload?.gatewayId,
    ];

    if (Array.isArray(payload?.detections)) {
      for (const detection of payload.detections) {
        candidates.push(
          detection?.device_id,
          detection?.deviceId,
          detection?.DeviceID,
          detection?.deviceid,
          detection?.reader_id,
          detection?.readerId,
          detection?.gateway_id,
          detection?.gatewayId,
        );
      }
    }

    for (const candidate of candidates) {
      const normalized = this.toNumber(candidate);
      if (normalized !== null) {
        return normalized;
      }
    }

    const deepSearch = this.searchIdByKey(payload, 0);
    if (deepSearch !== null) {
      return deepSearch;
    }

    return null;
  }

  private toNumber(value: any): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) return null;
      const parsed = Number(trimmed);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private extractMacAddress(payload: any): string | null {
    const candidates: any[] = [
      payload?.mac_address,
      payload?.macAddress,
      payload?.device?.mac_address,
      payload?.device?.macAddress,
      payload?.device?.mac,
    ];

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    if (Array.isArray(payload?.detections)) {
      for (const detection of payload.detections) {
        const nestedCandidates = [
          detection?.mac_address,
          detection?.macAddress,
          detection?.device_mac,
        ];
        for (const value of nestedCandidates) {
          if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
          }
        }
      }
    }

    return null;
  }

  private searchIdByKey(source: any, depth: number): number | null {
    if (!source || typeof source !== 'object' || depth > 4) {
      return null;
    }

    const entries = Array.isArray(source) ? source.entries() : Object.entries(source);

    for (const [key, value] of entries as Iterable<[any, any]>) {
      const keyStr = String(key).toLowerCase();
      const isPotentialId =
        (keyStr.includes('device') && keyStr.includes('id')) ||
        keyStr === 'reader_id' ||
        keyStr === 'readerid' ||
        keyStr === 'gateway_id' ||
        keyStr === 'gatewayid';

      if (isPotentialId) {
        const numeric = this.toNumber(value);
        if (numeric !== null) {
          return numeric;
        }
      }

      if (typeof value === 'object') {
        const nested = this.searchIdByKey(value, depth + 1);
        if (nested !== null) {
          return nested;
        }
      }
    }

    return null;
  }

  private describePayload(payload: any): string {
    try {
      if (!payload || typeof payload !== 'object') {
        return typeof payload;
      }

      const summary: Record<string, any> = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            summary[key] = `array(len=${value.length})`;
          } else {
            const nestedKeys = Object.keys(value).slice(0, 5);
            summary[key] = `object(keys=${nestedKeys.join(',')}${Object.keys(value).length > nestedKeys.length ? ',…' : ''})`;
          }
        } else {
          summary[key] = value;
        }
      }

      return JSON.stringify(summary);
    } catch (err) {
      return `unserializable: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}