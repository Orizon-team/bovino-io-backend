import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';
import { CreateZoneInput } from './dto/create-zone.input';

@Injectable()
export class ZoneService {
  constructor(@InjectRepository(Zone) private repo: Repository<Zone>) {}

  async create(input: CreateZoneInput): Promise<Zone> {
    const { id_user, ...rest } = input;
    const zone = this.repo.create(rest as Partial<Zone>);

    if (id_user !== undefined) {
      zone.user = { id: id_user } as any;
    }

    const saved = await this.repo.save(zone);
    return this.findOneById(saved.id);
  }

  async findAll(): Promise<Zone[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOneById(id: number): Promise<Zone> {
    const z = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!z) throw new NotFoundException('Zone not found');
    return z;
  }

  async findByName(name: string): Promise<Zone | null> {
    return this.repo.findOne({ where: { name }, relations: ['user'] });
  }
}
