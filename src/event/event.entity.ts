import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';

@ObjectType()
@Entity({ name: 'Event' })
export class Evento {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'Event_Code' })
  Codigo_Evento: number;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'Event_Type' })
  Tipo_Evento: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'Event_Description' })
  Descripcion_Evento?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true, default: () => 'CURRENT_DATE', name: 'date' })
  fecha?: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true, default: () => 'CURRENT_TIME', name: 'time' })
  hora?: string;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_cow' })
  vaca?: Vaca;

  @Field(() => Tag, { nullable: true })
  @ManyToOne(() => Tag, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_tag' })
  tag?: Tag;

  @Field(() => DispositivoESP32, { nullable: true })
  @ManyToOne(() => DispositivoESP32, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_device' })
  dispositivo?: DispositivoESP32;
}
