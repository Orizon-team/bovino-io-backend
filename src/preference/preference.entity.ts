import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';
import { Zone } from '../zone/zone.entity';

@ObjectType()
@Entity({ name: 'Preference' })
export class Preferencia {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_cow' })
  cow?: Vaca;

  @Field(() => Zone, { nullable: true })
  @ManyToOne(() => Zone, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_zone' })
  zone?: Zone;

  @Field(() => Int)
  @Column({ type: 'int', default: 0, name: 'visit_count' })
  visit_count: number;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_visit' })
  last_visit?: Date;
}
