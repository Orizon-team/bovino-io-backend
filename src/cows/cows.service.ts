import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';
import { encryptText, decryptText } from '../utils/crypto';

@Injectable()
export class VacasService {
  constructor(
    @InjectRepository(Vaca) private vacasRepo: Repository<Vaca>,
  ) {}

  async create(input: CreateVacaInput): Promise<Vaca> {
    const existing = await this.vacasRepo.findOne({ where: { tag_id: input.tag_id } });
    if (existing) throw new ConflictException('Tag ya registrada');
    // If an image URL is provided, encrypt it before saving
    const payload: Partial<Vaca> = { ...input } as Partial<Vaca>;
    if (payload.imagen) {
      payload.imagen = encryptText(payload.imagen);
    }

    const v = this.vacasRepo.create(payload);
    const saved = await this.vacasRepo.save(v);
    // Return with decrypted imagen for API consumers
    if (saved.imagen) saved.imagen = decryptText(saved.imagen);
    return saved;
  }

  async findAll(): Promise<Vaca[]> {
    const list = await this.vacasRepo.find();
    return list.map((v) => {
      if (v.imagen) v.imagen = decryptText(v.imagen);
      return v;
    });
  }

  async findOneById(id: number): Promise<Vaca> {
    const v = await this.vacasRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vaca no encontrada');
    if (v.imagen) v.imagen = decryptText(v.imagen);
    return v;
  }

  async findByTag(tag: string): Promise<Vaca | null> {
    const v = await this.vacasRepo.findOne({ where: { tag_id: tag } });
    if (!v) return null;
    if (v.imagen) v.imagen = decryptText(v.imagen);
    return v;
  }
}
