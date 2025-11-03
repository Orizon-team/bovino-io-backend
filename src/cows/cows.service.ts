import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';

@Injectable()
export class VacasService {
  constructor(
    @InjectRepository(Vaca) private vacasRepo: Repository<Vaca>,
  ) {}

  async create(input: CreateVacaInput): Promise<Vaca> {
    const existing = await this.vacasRepo.findOne({ where: { tag_id: input.tag_id } });
    if (existing) throw new ConflictException('Tag ya registrada');

    const v = this.vacasRepo.create(input as Partial<Vaca>);
    return this.vacasRepo.save(v);
  }

  async findAll(): Promise<Vaca[]> {
    return this.vacasRepo.find();
  }

  async findOneById(id: number): Promise<Vaca> {
    const v = await this.vacasRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vaca no encontrada');
    return v;
  }

  async findByTag(tag: string): Promise<Vaca | null> {
    return this.vacasRepo.findOne({ where: { tag_id: tag } });
  }
}
