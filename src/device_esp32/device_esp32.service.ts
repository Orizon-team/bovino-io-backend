import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispositivoESP32 } from './device_esp32.entity';
import { CreateDispositivoInput } from './dto/create-device_esp32.input';

@Injectable()
export class DispositivosService {
  constructor(
    @InjectRepository(DispositivoESP32) private repo: Repository<DispositivoESP32>,
  ) {}

  async create(input: CreateDispositivoInput): Promise<DispositivoESP32> {
    const d = this.repo.create(input as Partial<DispositivoESP32>);
    return this.repo.save(d);
  }

  async findAll(): Promise<DispositivoESP32[]> {
    return this.repo.find();
  }

  async findOneById(id: number): Promise<DispositivoESP32> {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Dispositivo no encontrado');
    return d;
  }
}
