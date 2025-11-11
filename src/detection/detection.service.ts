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
    const raw: any = input as any;
    const payload: Partial<Deteccion> = {};

    // resolve tag
    const tagRepo = this.repo.manager.getRepository('Tag');
    const tag = await tagRepo.findOne({ where: { id: Number(raw.id_tag) } });
    if (!tag) throw new NotFoundException('Tag no encontrado');
    payload.tag = tag as any;

    // resolve device
    const deviceRepo = this.repo.manager.getRepository('DispositivoESP32');
    const device = await deviceRepo.findOne({ where: { id: Number(raw.id_device) } });
    if (!device) throw new NotFoundException('Dispositivo no encontrado');
    payload.device = device as any;

    // map fields accepting spanish/english aliases
    if (raw.intensidad_senal !== undefined) payload.rssi = raw.intensidad_senal;
    if (raw.rssi !== undefined) payload.rssi = raw.rssi;

    if (raw.distance !== undefined) payload.distance = raw.distance;

    if (raw.is_present !== undefined) payload.is_present = raw.is_present;

    const parseDate = (value: any): Date | undefined => {
      if (value === undefined || value === null) return undefined;
      if (value instanceof Date) return value;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    const firstSeen = raw.first_seen ?? raw.fecha;
    const lastSeen = raw.last_seen;
    const parsedFirstSeen = parseDate(firstSeen);
    const parsedLastSeen = parseDate(lastSeen);

    if (parsedFirstSeen) payload.first_seen = parsedFirstSeen;
    if (parsedLastSeen) payload.last_seen = parsedLastSeen;

    const det = this.repo.create(payload);
    const saved = await this.repo.save(det);
    return this.findOneById(saved.id);
  }

  async findAll(): Promise<Deteccion[]> {
    return this.repo.find({ relations: ['tag', 'device'] });
  }

  async findOneById(id: number): Promise<Deteccion> {
    const d = await this.repo.findOne({ where: { id }, relations: ['tag', 'device'] });
    if (!d) throw new NotFoundException('Deteccion no encontrada');
    return d;
  }

  async update(id: number, input: Partial<Deteccion> & any): Promise<Deteccion> {
    const det = await this.findOneById(id);

    if (input.id_tag !== undefined) {
      const tagRepo = this.repo.manager.getRepository('Tag');
      const tag = await tagRepo.findOne({ where: { id: Number(input.id_tag) } });
      if (!tag) throw new NotFoundException('Tag no encontrado');
      det.tag = tag as any;
    }
    if (input.id_device !== undefined) {
      const deviceRepo = this.repo.manager.getRepository('DispositivoESP32');
      const device = await deviceRepo.findOne({ where: { id: Number(input.id_device) } });
      if (!device) throw new NotFoundException('Dispositivo no encontrado');
      det.device = device as any;
    }

    // Accept multiple possible field names (Spanish/English) and map to entity props
    if (input.intensidad_senal !== undefined) det.rssi = input.intensidad_senal;
    if (input.rssi !== undefined) det.rssi = input.rssi;

    if (input.distance !== undefined) det.distance = input.distance;

    if (input.is_present !== undefined) det.is_present = input.is_present;

    const parseDate = (value: any): Date | undefined => {
      if (value === undefined || value === null) return undefined;
      if (value instanceof Date) return value;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    const firstSeen = input.first_seen ?? input.fecha;
    const lastSeen = input.last_seen;
    const parsedFirstSeen = parseDate(firstSeen);
    const parsedLastSeen = parseDate(lastSeen);

    if (parsedFirstSeen !== undefined) det.first_seen = parsedFirstSeen;
    if (parsedLastSeen !== undefined) det.last_seen = parsedLastSeen;

    const saved = await this.repo.save(det);
    return this.findOneById(saved.id);
  }
}
