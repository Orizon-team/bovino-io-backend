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
    if (raw.id !== undefined || raw.id_vaca !== undefined || raw.id_cow !== undefined) {
      throw new ConflictException('El id ya no es editable; se genera automáticamente.');
    }

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

    if (tag && tag.status !== 'active') {
      tag.status = 'active';
      await tagRepo.save(tag);
    }
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
    const raw: any = input as any;
    if (raw.id !== undefined || raw.id_vaca !== undefined || raw.nuevo_id !== undefined) {
      throw new ConflictException('El id de la vaca no es editable.');
    }

    // map possible input fields (accept spanish/english)
    if (raw.nombre !== undefined) v.name = raw.nombre;
    if (raw.name !== undefined) v.name = raw.name;

    if (raw.comida_preferida !== undefined) v.favorite_food = raw.comida_preferida;
    if (raw.favorite_food !== undefined) v.favorite_food = raw.favorite_food;

    if (raw.id_usuario !== undefined) {
      if (raw.id_usuario === null) v.user = undefined as any;
      else {
        const userRepo = this.vacasRepo.manager.getRepository('User');
        const user = await userRepo.findOne({ where: { id_user: Number(raw.id_usuario) } });
        if (!user) throw new NotFoundException('User no encontrado');
        v.user = user as any;
      }
    }
    if (raw.id_user !== undefined) {
      if (raw.id_user === null) v.user = undefined as any;
      else {
        const userRepo = this.vacasRepo.manager.getRepository('User');
        const user = await userRepo.findOne({ where: { id_user: Number(raw.id_user) } });
        if (!user) throw new NotFoundException('User no encontrado');
        v.user = user as any;
      }
    }

    if (raw.tag_id !== undefined) {
      // find tag by PK or id_tag
      const tagRepo = this.vacasRepo.manager.getRepository('Tag');
      let tag = await tagRepo.findOne({ where: { id: Number(raw.tag_id) } });
      if (!tag) tag = await tagRepo.findOne({ where: { id_tag: String(raw.tag_id) } });
      if (!tag) throw new NotFoundException('Tag no encontrado');
      v.tag = tag as any;
      if (tag.id_tag) {
        v.ear_tag = tag.id_tag;
      }
    }

    if (raw.imagen !== undefined) v.image = raw.imagen ? encryptText(raw.imagen) : undefined;
    if (raw.image !== undefined) v.image = raw.image ? encryptText(raw.image) : undefined;

    const saved = await this.vacasRepo.save(v);
    return this.findOneById(saved.id);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.vacasRepo.delete({ id });
    if (res.affected && res.affected > 0) return true;
    throw new NotFoundException('Vaca no encontrada');
  }
}
