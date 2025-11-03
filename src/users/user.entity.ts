import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType() // para GraphQL
@Entity({ name: 'Users' }) // mapped to English table name
export class User {
@Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_usuario: number; // DB column is id_user, property kept for compatibility

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name' })
  nombre?: string;

@Field(() => String)
  @Column({ type: 'varchar', length: 100, name: 'email', unique: true })
  correo_electronico: string;

  // NO exponer contrasena en GraphQL (omitimos @Field)
  @Column({ type: 'varchar', length: 255, name: 'password' })
  contrasena: string;
}
