import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../users/user.entity';


@ObjectType()
@Entity({ name: 'Vacas' })
export class Vaca {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'tag_id', unique: true })
  tag_id: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario?: User;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'comida_preferida' })
  comida_preferida?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen?: string;
}
