import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { CreateDeteccionInput } from './dto/create-detection.input';

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

  async update(id: number, input: Partial<Deteccion> & any): Promise<Deteccion> {
    const det = await this.findOneById(id);

    if (input.id_tag !== undefined) {
      det.tag = { id: input.id_tag } as any;
    }
    if (input.id_device !== undefined) {
      det.device = { id: input.id_device } as any;
    }
  // Accept multiple possible field names (Spanish/English) and map to entity props
  if (input.intensidad_senal !== undefined) det.rssi = input.intensidad_senal;
  if (input.rssi !== undefined) det.rssi = input.rssi;
  if (input.distance !== undefined) det.distance = input.distance;
  if (input.is_present !== undefined) det.is_present = input.is_present;
  if (input.fecha !== undefined) det.first_seen = input.fecha instanceof Date ? input.fecha : new Date(input.fecha);
  if (input.first_seen !== undefined) det.first_seen = input.first_seen instanceof Date ? input.first_seen : new Date(input.first_seen);
  if (input.last_seen !== undefined) det.last_seen = input.last_seen instanceof Date ? input.last_seen : new Date(input.last_seen);

    const saved = await this.repo.save(det);
    return this.findOneById(saved.id);
  }
}
