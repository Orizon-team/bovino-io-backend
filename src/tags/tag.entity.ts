import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';

@ObjectType()
@Entity({ name: 'Tag' })
export class Tag {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => String)
  @Column({ type: 'bigint', name: 'id_tag' })
  id_tag: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 17, name: 'mac_address' })
  mac_address?: string;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'float', nullable: true, default: 100, name: 'battery_level' })
  battery_level?: number;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_transmission' })
  last_transmission?: Date;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'active', name: 'status' })
  status?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'current_location' })
  current_location?: string;
}
