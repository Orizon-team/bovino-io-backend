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
    // Ensure the Tag exists
    const tagRepo = this.vacasRepo.manager.getRepository('Tag');
    const tag = await tagRepo.findOne({ where: { id: input.tag_id } });
    if (!tag) throw new NotFoundException('Tag no encontrado');

    // Prepare payload
    const payload: Partial<Vaca> = { ...input } as any;
    // attach relation
    (payload as any).tag = { id: input.tag_id };
    if ((payload as any).imagen) {
      (payload as any).image = encryptText((payload as any).imagen);
      delete (payload as any).imagen;
    }

    const v = this.vacasRepo.create(payload as Partial<Vaca>);
    const saved = await this.vacasRepo.save(v);
    // decrypt image for API
    if (saved.image) saved.image = decryptText(saved.image);
    return saved;
  }

  async findAll(): Promise<Vaca[]> {
    const list = await this.vacasRepo.find();
    return list.map((v) => {
      if (v.image) v.image = decryptText(v.image);
      return v;
    });
  }

  async findOneById(id: number): Promise<Vaca> {
    const v = await this.vacasRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vaca no encontrada');
    if (v.image) v.image = decryptText(v.image);
    return v;
  }

  async findByTag(tag: number): Promise<Vaca | null> {
    const v = await this.vacasRepo.findOne({ where: { tag: { id: tag } }, relations: ['tag'] });
    if (!v) return null;
    if (v.image) v.image = decryptText(v.image);
    return v;
  }
}
