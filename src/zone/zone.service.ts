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
      // User primary key property is `id_user` in the User entity, set that field
      zone.user = { id_user: id_user } as any;
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

  async findByUserId(id_user: number): Promise<Zone[]> {
    return this.repo.createQueryBuilder('zone')
      .leftJoinAndSelect('zone.user', 'user')
      .where('user.id_user = :id_user', { id_user })
      .getMany();
  }

  async update(id: number, input: Partial<Zone>): Promise<Zone> {
    const zone = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!zone) throw new NotFoundException('Zone not found');

    // Map allowed fields
    if ((input as any).name !== undefined) zone.name = (input as any).name;
    if ((input as any).description !== undefined) zone.description = (input as any).description;
    if ((input as any).location !== undefined) zone.location = (input as any).location;

    // id_user can be number or null
    if ((input as any).id_user !== undefined) {
      const v = (input as any).id_user;
      if (v === null) {
        // explicit removal of relation
        (zone as any).user = undefined;
      } else {
        zone.user = { id_user: v } as any;
      }
    }

    const saved = await this.repo.save(zone);
    return this.findOneById(saved.id);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.repo.delete({ id });
    if (res.affected && res.affected > 0) return true;
    throw new NotFoundException('Zone not found');
  }
}
