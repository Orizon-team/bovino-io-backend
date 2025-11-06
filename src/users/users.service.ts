import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: createUserInput.email } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    const hashed = await bcrypt.hash(createUserInput.password, 10);
    const user = this.usersRepo.create({ ...createUserInput, password: hashed });
    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOneById(id: number): Promise<User> {
    const u = await this.usersRepo.findOne({ where: { id_user: id }});
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email }});
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const matched = await bcrypt.compare(password, user.password);
    return matched ? user : null;
  }

  async update(id: number, updateData: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(id);

    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.findByEmail(updateData.email);
      if (existing && existing.id_user !== id) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    if (updateData.password) {
      const hashed = await bcrypt.hash(updateData.password, 10);
      updateData = { ...updateData, password: hashed };
    }

    const updated = this.usersRepo.merge(user, updateData as Partial<User>);
    return this.usersRepo.save(updated);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.usersRepo.delete({ id_user: id });
    if (res.affected && res.affected > 0) return true;
    throw new NotFoundException('Usuario no encontrado');
  }
}
