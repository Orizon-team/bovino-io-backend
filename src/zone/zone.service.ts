import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';
import { CreateZoneInput } from './dto/create-zone.input';

@Injectable()
export class ZoneService {
  constructor(@InjectRepository(Zone) private repo: Repository<Zone>) {}

  async create(input: CreateZoneInput): Promise<Zone> {
    const z = this.repo.create(input as Partial<Zone>);
    return this.repo.save(z);
  }

  async findAll(): Promise<Zone[]> {
    return this.repo.find();
  }

  async findOneById(id: number): Promise<Zone> {
    const z = await this.repo.findOne({ where: { id } });
    if (!z) throw new NotFoundException('Zone not found');
    return z;
  }
}
