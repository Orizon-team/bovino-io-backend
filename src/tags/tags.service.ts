import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { TagLocationInput } from './dto/tag-location.input';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagsRepo: Repository<Tag>,
  ) {}

  async create(input: CreateTagInput): Promise<Tag> {
    // Normalize last_transmission: accept ISO string and convert to Date so TypeORM/Apollo DateTime serializer works
    const payload: any = { ...input } as any;
    if (payload.last_transmission) {
      const d = payload.last_transmission instanceof Date ? payload.last_transmission : new Date(payload.last_transmission);
      payload.last_transmission = isNaN(d.getTime()) ? undefined : d;
    }
    if (payload.mac_address) payload.mac_address = this.normalizeMac(payload.mac_address);
    payload.current_location = this.normalizeLocation(payload.current_location);
    const t = this.tagsRepo.create(payload as Partial<Tag>);
    return this.tagsRepo.save(t);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepo.find();
  }

  async findOneById(id: number): Promise<Tag> {
    const t = await this.tagsRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tag no encontrado');
    return t;
  }

  async findByVaca(id_vaca: number): Promise<Tag | null> {
    // Find tag by joining with Cows table where cow.tag_id = tag.id
    return this.tagsRepo.createQueryBuilder('tag')
      .innerJoin('Cows', 'cow', 'cow.tag_id = tag.id')
      .where('cow.id = :id_vaca', { id_vaca })
      .getOne();
  }

  async findByIdTag(id_tag: string): Promise<Tag | null> {
    return this.tagsRepo.findOne({ where: { id_tag } });
  }

  async findByMacAddress(mac: string): Promise<Tag | null> {
    const normalized = this.normalizeMac(mac);
    const compact = normalized.replace(/:/g, '');
    const candidates = new Set<string>();
    candidates.add(normalized);
    candidates.add(compact);
    const original = mac.trim().toUpperCase();
    candidates.add(original);

    return this.tagsRepo.findOne({
      where: Array.from(candidates).map((value) => ({ mac_address: value })),
    });
  }

  async saveTag(tag: Tag): Promise<Tag> {
    return this.tagsRepo.save(tag);
  }

  async update(id: number, input: UpdateTagInput | Partial<Tag>): Promise<Tag> {
    const tag = await this.findOneById(id);
    const payload: any = { ...input } as any;
    if (payload.last_transmission) {
      const d = payload.last_transmission instanceof Date ? payload.last_transmission : new Date(payload.last_transmission);
      payload.last_transmission = isNaN(d.getTime()) ? undefined : d;
    }
    if (payload.mac_address) payload.mac_address = this.normalizeMac(payload.mac_address);
    payload.current_location = this.normalizeLocation(payload.current_location);
    const merged = this.tagsRepo.merge(tag, payload as Partial<Tag>);
    return this.tagsRepo.save(merged);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.tagsRepo.delete({ id });
    if (res.affected && res.affected > 0) return true;
    throw new NotFoundException('Tag no encontrado');
  }

  private normalizeMac(mac: string): string {
    const trimmed = mac.trim().toUpperCase();
    const hexOnly = trimmed.replace(/[^0-9A-F]/g, '');
    if (hexOnly.length === 12) {
      const pairs = hexOnly.match(/.{1,2}/g);
      if (pairs) {
        return pairs.join(':');
      }
    }
    return trimmed;
  }

  private normalizeLocation(location?: TagLocationInput | string): string | undefined {
    if (!location) {
      return undefined;
    }
    if (typeof location === 'string') {
      const trimmed = location.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    const name = location.name?.trim();
    if (name) {
      return name;
    }
    if (typeof location.id === 'number') {
      return `Zona ${location.id}`;
    }
    return undefined;
  }
}
