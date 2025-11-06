import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';

@ObjectType()
@Entity({ name: 'Event' })
export class Evento {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id_event: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'Event_Code' })
  Event_Code?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'Event_Type' })
  Event_Type?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'Event_Description' })
  Event_Description?: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true, name: 'time' })
  time?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true, name: 'date' })
  date?: string;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_cow' })
  cow?: Vaca;

  @Field(() => Tag, { nullable: true })
  @ManyToOne(() => Tag, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_tag' })
  tag?: Tag;

  @Field(() => DispositivoESP32, { nullable: true })
  @ManyToOne(() => DispositivoESP32, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_device' })
  device?: DispositivoESP32;
}
