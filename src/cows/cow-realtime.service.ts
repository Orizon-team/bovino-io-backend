import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaca } from './cow.entity';
import { Deteccion } from '../detection/detection.entity';
import { Tag } from '../tags/tag.entity';
import { decryptText } from '../utils/crypto';

export interface CowRealtimeSnapshot {
  id: number;
  name: string | null;
  image: string | null;
  ear_tag: string | null;
  favorite_food: string | null;
  status: string | null;
  zone: { id: number; name: string | null } | null;
  last_seen: string | null;
}

@Injectable()
export class CowRealtimeService {
  constructor(
    @InjectRepository(Vaca) private readonly cowsRepo: Repository<Vaca>,
    @InjectRepository(Deteccion) private readonly detectionsRepo: Repository<Deteccion>,
    @InjectRepository(Tag) private readonly tagsRepo: Repository<Tag>,
  ) {}

  async getCowSnapshot(cowId: number): Promise<CowRealtimeSnapshot> {
    const cow = await this.cowsRepo.findOne({ where: { id: cowId }, relations: ['tag'] });
    if (!cow) {
      throw new NotFoundException('Vaca no encontrada');
    }

    const tagId = cow.tag?.id ?? null;
    let zone: CowRealtimeSnapshot['zone'] = null;
    let lastSeen: string | null = null;
    let status: string | null = null;

    if (tagId) {
      const detection = await this.detectionsRepo.findOne({
        where: { tag: { id: tagId } },
        relations: ['device', 'device.zone'],
        order: { last_seen: 'DESC' },
      });

      if (detection) {
        const deviceZone = detection.device?.zone ?? null;
        if (deviceZone) {
          zone = { id: deviceZone.id, name: deviceZone.name ?? null };
        }
        const seenDate = detection.last_seen ?? detection.first_seen ?? null;
        if (seenDate) {
          lastSeen = seenDate instanceof Date ? seenDate.toISOString() : new Date(seenDate).toISOString();
        }
      }

      const tag = await this.tagsRepo.findOne({ where: { id: tagId } });
      status = tag?.status ?? null;
    }

    const image = cow.image ? decryptText(cow.image) : null;
    const earTag = cow.ear_tag ?? cow.tag?.id_tag ?? null;

    return {
      id: cow.id,
      name: cow.name ?? null,
      image,
      ear_tag: earTag,
      favorite_food: cow.favorite_food ?? null,
      status,
      zone,
      last_seen: lastSeen,
    };
  }
}
