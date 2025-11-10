import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from './event.entity';
import { CreateEventoInput } from './dto/create-event.input';

@Injectable()
export class EventosService {
  constructor(@InjectRepository(Evento) private repo: Repository<Evento>) {}

  async create(input: CreateEventoInput): Promise<Evento> {
    const e = this.repo.create(input as Partial<Evento>);
    return this.repo.save(e);
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
  if (input.id_cow !== undefined) e.cow = input.id_cow === null ? undefined as any : ({ id: input.id_cow } as any);
  if (input.id_tag !== undefined) e.tag = input.id_tag === null ? undefined as any : ({ id: input.id_tag } as any);
  if (input.id_device !== undefined) e.device = input.id_device === null ? undefined as any : ({ id: input.id_device } as any);

    const saved = await this.repo.save(e);
    return this.findOneById(saved.id_event) as Promise<Evento>;
  }
}
