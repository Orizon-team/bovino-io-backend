import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preferencia } from './preference.entity';
import { CreatePreferenciaInput } from './dto/create-preference.input';

@Injectable()
export class PreferenciasService {
  constructor(@InjectRepository(Preferencia) private repo: Repository<Preferencia>) {}

  async create(input: CreatePreferenciaInput): Promise<Preferencia> {
    const p = this.repo.create(input as Partial<Preferencia>);
    return this.repo.save(p);
  }

  async findAll(): Promise<Preferencia[]> {
    return this.repo.find({ relations: ['vaca', 'zona'] });
  }

  async findOneById(id: number): Promise<Preferencia> {
    const p = await this.repo.findOne({ where: { id }, relations: ['vaca', 'zona'] });
    if (!p) throw new NotFoundException('Preferencia no encontrada');
    return p;
  }

  async update(id: number, input: Partial<Preferencia> & any): Promise<Preferencia> {
    const pref = await this.findOneById(id);

  if (input.id_cow !== undefined) pref.cow = input.id_cow === null ? undefined as any : ({ id: input.id_cow } as any);
  if (input.id_zone !== undefined) pref.zone = input.id_zone === null ? undefined as any : ({ id: input.id_zone } as any);
  if (input.visit_count !== undefined) pref.visit_count = input.visit_count;
  if (input.last_visit !== undefined) pref.last_visit = input.last_visit instanceof Date ? input.last_visit : new Date(input.last_visit);

    const saved = await this.repo.save(pref);
    return this.findOneById(saved.id);
  }
}
