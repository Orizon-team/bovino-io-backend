import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { correo_electronico: createUserInput.correo_electronico } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    const hashed = await bcrypt.hash(createUserInput.contrasena, 10);
    const user = this.usersRepo.create({ ...createUserInput, contrasena: hashed });
    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOneById(id: number): Promise<User> {
    const u = await this.usersRepo.findOne({ where: { id_usuario: id }});
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { correo_electronico: email }});
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const matched = await bcrypt.compare(password, user.contrasena);
    return matched ? user : null;
  }
}
