import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './zone.entity';

@Injectable()
export class ZonaService {
  constructor(@InjectRepository(Zona) private repo: Repository<Zona>) {}

  async findAll(): Promise<Zona[]> {
    return this.repo.find();
  }
}
