import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preferencia } from './preferencia.entity';
import { CreatePreferenciaInput } from './dto/create-preferencia.input';

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
}
