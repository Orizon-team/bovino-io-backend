import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './deteccion.entity';
import { CreateDeteccionInput } from './dto/create-deteccion.input';

@Injectable()
export class DeteccionesService {
  constructor(
    @InjectRepository(Deteccion) private repo: Repository<Deteccion>,
  ) {}

  async create(input: CreateDeteccionInput): Promise<Deteccion> {
    const d = this.repo.create(input as Partial<Deteccion>);
    return this.repo.save(d);
  }

  async findAll(): Promise<Deteccion[]> {
    return this.repo.find({ relations: ['tag', 'dispositivo'] });
  }

  async findOneById(id: number): Promise<Deteccion> {
    const d = await this.repo.findOne({ where: { id }, relations: ['tag', 'dispositivo'] });
    if (!d) throw new NotFoundException('Deteccion no encontrada');
    return d;
  }
}
