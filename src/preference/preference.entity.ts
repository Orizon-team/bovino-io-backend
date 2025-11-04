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

  @Field(() => Vaca)
  @ManyToOne(() => Vaca, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cow' })
  vaca: Vaca;

  @Field(() => Zone)
  @ManyToOne(() => Zone, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_zone' })
  zona: Zone;

  @Field(() => Int)
  @Column({ type: 'int', default: 0, name: 'visit_count' })
  numero_de_visitas: number;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_visit' })
  ultima_visita?: Date;
}
