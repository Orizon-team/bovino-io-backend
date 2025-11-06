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
}
