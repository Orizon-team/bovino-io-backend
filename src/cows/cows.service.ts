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
    // Normalize input fields (accept both GraphQL spanish fields and REST english fields)
    const raw: any = input as any;
    const payload: any = {};

    // tag id: accept tag_id (PK) or tag object
    const tagId = raw.tag_id ?? raw.tag ?? (raw.tag && raw.tag.id);
    // name: accept name or nombre
    payload.name = raw.name ?? raw.nombre;
    // id_user -> attach user relation if provided (validate existence)
    const userId = raw.id_user ?? raw.id_usuario;
    if (userId !== undefined && userId !== null) {
      const userRepo = this.vacasRepo.manager.getRepository('User');
      const user = await userRepo.findOne({ where: { id_user: Number(userId) } });
      if (!user) {
        // fail early with clear error instead of silently saving null relation
        throw new NotFoundException('User no encontrado');
      }
      payload.user = user;
    }
    // favorite_food
    payload.favorite_food = raw.favorite_food ?? raw.comida_preferida;
    // image: accept uploaded 'imagen' or 'image'
    if (raw.imagen) payload.image = encryptText(raw.imagen);
    else if (raw.image) payload.image = encryptText(raw.image);

    // Validate required fields
    if (!tagId) throw new ConflictException('tag_id is required');
    if (!payload.name) throw new ConflictException('name is required');

    // Ensure the Tag exists (try PK first, then id_tag)
    const tagRepo = this.vacasRepo.manager.getRepository('Tag');
    let tag = await tagRepo.findOne({ where: { id: Number(tagId) } });
    if (!tag) {
      // try matching id_tag (string)
      tag = await tagRepo.findOne({ where: { id_tag: String(tagId) } });
    }
    if (!tag) throw new NotFoundException('Tag no encontrado');

  // attach relation - use full Tag entity so GraphQL fields like id_tag are available
  payload.tag = tag;
  // set ear_tag on the cow from the tag's id_tag if available
  if (tag && tag.id_tag) payload.ear_tag = tag.id_tag;

    const v = this.vacasRepo.create(payload as Partial<Vaca>);
    const saved = await this.vacasRepo.save(v);
    // decrypt image for API
    if (saved.image) saved.image = decryptText(saved.image);
    return saved;
  }

  async findAll(): Promise<Vaca[]> {
    const list = await this.vacasRepo.find({ relations: ['tag', 'user'] });
    return list.map((v) => {
      if (v.image) v.image = decryptText(v.image);
      return v;
    });
  }

  async findOneById(id: number): Promise<Vaca> {
    const v = await this.vacasRepo.findOne({ where: { id }, relations: ['tag', 'user'] });
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

  async findByUserId(userId: number): Promise<Vaca[]> {
    const list = await this.vacasRepo.find({ where: { user: { id_user: userId } }, relations: ['tag', 'user'] });
    return list.map((v) => {
      if (v.image) v.image = decryptText(v.image);
      return v;
    });
  }

  async update(id: number, input: Partial<Vaca> & any): Promise<Vaca> {
    const v = await this.findOneById(id);

    // map possible input fields (accept spanish/english)
    if (input.nombre !== undefined) v.name = input.nombre;
    if (input.name !== undefined) v.name = input.name;

    if (input.comida_preferida !== undefined) v.favorite_food = input.comida_preferida;
    if (input.favorite_food !== undefined) v.favorite_food = input.favorite_food;

    if (input.id_usuario !== undefined) {
      if (input.id_usuario === null) v.user = undefined as any;
      else {
        const userRepo = this.vacasRepo.manager.getRepository('User');
        const user = await userRepo.findOne({ where: { id_user: Number(input.id_usuario) } });
        if (!user) throw new NotFoundException('User no encontrado');
        v.user = user as any;
      }
    }
    if (input.id_user !== undefined) {
      if (input.id_user === null) v.user = undefined as any;
      else {
        const userRepo = this.vacasRepo.manager.getRepository('User');
        const user = await userRepo.findOne({ where: { id_user: Number(input.id_user) } });
        if (!user) throw new NotFoundException('User no encontrado');
        v.user = user as any;
      }
    }

    if (input.tag_id !== undefined) {
      // find tag by PK or id_tag
      const tagRepo = this.vacasRepo.manager.getRepository('Tag');
      let tag = await tagRepo.findOne({ where: { id: Number(input.tag_id) } });
      if (!tag) tag = await tagRepo.findOne({ where: { id_tag: String(input.tag_id) } });
      if (!tag) throw new NotFoundException('Tag no encontrado');
  v.tag = tag as any;
    }

    if (input.imagen !== undefined) v.image = input.imagen ? encryptText(input.imagen) : undefined;
    if (input.image !== undefined) v.image = input.image ? encryptText(input.image) : undefined;

    const saved = await this.vacasRepo.save(v);
    if (saved.image) saved.image = decryptText(saved.image);
    return saved;
  }
}
