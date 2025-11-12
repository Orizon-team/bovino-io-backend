import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preferencia } from './preference.entity';
import { CreatePreferenciaInput } from './dto/create-preference.input';

@Injectable()
export class PreferenciasService {
  constructor(@InjectRepository(Preferencia) private repo: Repository<Preferencia>) {}

  async create(input: CreatePreferenciaInput): Promise<Preferencia> {
    const raw: any = input as any;
    const payload: Partial<Preferencia> = {};

    if (raw.visit_count !== undefined) payload.visit_count = raw.visit_count;
    if (raw.last_visit !== undefined) payload.last_visit = raw.last_visit instanceof Date ? raw.last_visit : new Date(raw.last_visit);

    // resolve relations if ids provided
    if (raw.id_cow !== undefined && raw.id_cow !== null) {
      const cowRepo = this.repo.manager.getRepository('Vaca');
      const cow = await cowRepo.findOne({ where: { id: Number(raw.id_cow) } });
      if (!cow) throw new NotFoundException('Vaca no encontrada');
      payload.cow = cow as any;
    }
    if (raw.id_zone !== undefined && raw.id_zone !== null) {
      const zoneRepo = this.repo.manager.getRepository('Zone');
      const zone = await zoneRepo.findOne({ where: { id: Number(raw.id_zone) } });
      if (!zone) throw new NotFoundException('Zona no encontrada');
      payload.zone = zone as any;
    }

    const p = this.repo.create(payload as Partial<Preferencia>);
    const saved = await this.repo.save(p);
    return this.findOneById(saved.id);
  }

  async findAll(): Promise<Preferencia[]> {
    return this.repo.find({ relations: ['cow', 'zone'] });
  }

  async findOneById(id: number): Promise<Preferencia> {
    const p = await this.repo.findOne({ where: { id }, relations: ['cow', 'zone'] });
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
