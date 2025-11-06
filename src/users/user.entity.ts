import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType() // para GraphQL
@Entity({ name: 'Users' }) // mapped to English table name
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_user: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name' })
  name?: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100, name: 'email', unique: true })
  email: string;

  // password not exposed in GraphQL
  @Column({ type: 'varchar', length: 255, name: 'password' })
  password: string;
}
