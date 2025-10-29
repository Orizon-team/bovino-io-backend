import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType() // para GraphQL
@Entity({ name: 'Usuarios' }) // mapea exactamente a la tabla SQL
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre?: string;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'correo_electronico', unique: true })
  correo_electronico: string;

  // NO exponer contrasena en GraphQL (omitimos @Field)
  @Column({ type: 'varchar', length: 255, name: 'contrasena' })
  contrasena: string;
}
