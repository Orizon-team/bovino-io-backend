import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from './event.entity';
import { CreateEventoInput } from './dto/create-event.input';

@Injectable()
export class EventosService {
  constructor(@InjectRepository(Evento) private repo: Repository<Evento>) {}

  async create(input: CreateEventoInput): Promise<Evento> {
    const raw: any = input as any;
    const payload: Partial<Evento> = {};

    if (raw.Event_Type !== undefined) payload.Event_Type = raw.Event_Type;
    if (raw.Event_Description !== undefined) payload.Event_Description = raw.Event_Description;
  // accept Event_Code and English/Spanish date/time keys
  if (raw.Event_Code !== undefined) payload.Event_Code = raw.Event_Code;
  if (raw.event_code !== undefined) payload.Event_Code = raw.event_code;
  if (raw.codigo_evento !== undefined) payload.Event_Code = raw.codigo_evento;

  if (raw.date !== undefined) payload.date = raw.date;
  if (raw.time !== undefined) payload.time = raw.time;
  if (raw.fecha !== undefined) payload.date = raw.fecha;
  if (raw.hora !== undefined) payload.time = raw.hora;

    // resolve cow/tag/device relations when ids provided
    if (raw.id_cow !== undefined && raw.id_cow !== null) {
      const cowRepo = this.repo.manager.getRepository('Vaca');
      const cow = await cowRepo.findOne({ where: { id: Number(raw.id_cow) } });
      if (!cow) throw new NotFoundException('Vaca no encontrada');
      payload.cow = cow as any;
    }
    if (raw.id_tag !== undefined && raw.id_tag !== null) {
      const tagRepo = this.repo.manager.getRepository('Tag');
      const tag = await tagRepo.findOne({ where: { id: Number(raw.id_tag) } });
      if (!tag) throw new NotFoundException('Tag no encontrado');
      payload.tag = tag as any;
    }
    if (raw.id_device !== undefined && raw.id_device !== null) {
      const deviceRepo = this.repo.manager.getRepository('DispositivoESP32');
      const device = await deviceRepo.findOne({ where: { id: Number(raw.id_device) } });
      if (!device) throw new NotFoundException('Dispositivo no encontrado');
      payload.device = device as any;
    }

    const e = this.repo.create(payload as Partial<Evento>);
    const saved = await this.repo.save(e);
    return this.findOneById(saved.id_event) as Promise<Evento>;
  }

  async findAll(): Promise<Evento[]> {
    return this.repo.find({ relations: ['cow', 'tag', 'device'] });
  }

  async findOneById(id: number): Promise<Evento | null> {
    return this.repo.findOne({ where: { id_event: id }, relations: ['cow', 'tag', 'device'] });
  }

  async update(id: number, input: Partial<Evento> & any): Promise<Evento> {
    const e = await this.findOneById(id);
    if (!e) throw new Error('Evento no encontrado');

    if (input.Event_Type !== undefined) e.Event_Type = input.Event_Type;
  if (input.Event_Description !== undefined) e.Event_Description = input.Event_Description;
  if (input.Event_Code !== undefined) e.Event_Code = input.Event_Code as any;
  if (input.event_code !== undefined) e.Event_Code = input.event_code as any;
  if (input.codigo_evento !== undefined) e.Event_Code = input.codigo_evento as any;

  if (input.date !== undefined) e.date = input.date as any;
  if (input.time !== undefined) e.time = input.time as any;
  if (input.fecha !== undefined) e.date = input.fecha as any;
  if (input.hora !== undefined) e.time = input.hora as any;
  if (input.id_cow !== undefined) e.cow = input.id_cow === null ? undefined as any : ({ id: input.id_cow } as any);
  if (input.id_tag !== undefined) e.tag = input.id_tag === null ? undefined as any : ({ id: input.id_tag } as any);
  if (input.id_device !== undefined) e.device = input.id_device === null ? undefined as any : ({ id: input.id_device } as any);

    const saved = await this.repo.save(e);
    return this.findOneById(saved.id_event) as Promise<Evento>;
  }
}
