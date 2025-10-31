import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './zona.entity';
import { CreateZonaInput } from './dto/create-zona.input';

@Injectable()
export class ZonaService {
  constructor(@InjectRepository(Zona) private repo: Repository<Zona>) {}

  async create(input: CreateZonaInput): Promise<Zona> {
    const z = this.repo.create(input as Partial<Zona>);
    return this.repo.save(z);
  }

  async findAll(): Promise<Zona[]> {
    return this.repo.find();
  }

  async findOneById(id: number): Promise<Zona> {
    const z = await this.repo.findOne({ where: { id } });
    if (!z) throw new NotFoundException('Zona no encontrada');
    return z;
  }
}
