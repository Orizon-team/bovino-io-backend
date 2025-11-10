import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagsRepo: Repository<Tag>,
  ) {}

  async create(input: CreateTagInput): Promise<Tag> {
    // Si existe una restricción de unicidad en otro campo, comprobar aquí;
    const t = this.tagsRepo.create(input as Partial<Tag>);
    return this.tagsRepo.save(t);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepo.find();
  }

  async findOneById(id: number): Promise<Tag> {
    const t = await this.tagsRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tag no encontrado');
    return t;
  }

  async findByVaca(id_vaca: number): Promise<Tag | null> {
    // Find tag by joining with Cows table where cow.tag_id = tag.id
    return this.tagsRepo.createQueryBuilder('tag')
      .innerJoin('Cows', 'cow', 'cow.tag_id = tag.id')
      .where('cow.id = :id_vaca', { id_vaca })
      .getOne();
  }

  async findByIdTag(id_tag: string): Promise<Tag | null> {
    return this.tagsRepo.findOne({ where: { id_tag } });
  }

  async saveTag(tag: Tag): Promise<Tag> {
    return this.tagsRepo.save(tag);
  }

  async update(id: number, input: Partial<Tag>): Promise<Tag> {
    const tag = await this.findOneById(id);
    const merged = this.tagsRepo.merge(tag, input as Partial<Tag>);
    return this.tagsRepo.save(merged);
  }
}
