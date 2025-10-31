import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../vacas/vaca.entity';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../dispositivos/dispositivo.entity';

@ObjectType()
@Entity({ name: 'Evento' })
export class Evento {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'Codigo_Evento' })
  Codigo_Evento: number;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'Tipo_Evento' })
  Tipo_Evento: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'Descripcion_Evento' })
  Descripcion_Evento?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true, default: () => 'CURRENT_DATE', name: 'fecha' })
  fecha?: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true, default: () => 'CURRENT_TIME', name: 'hora' })
  hora?: string;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_vaca' })
  vaca?: Vaca;

  @Field(() => Tag, { nullable: true })
  @ManyToOne(() => Tag, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_tag' })
  tag?: Tag;

  @Field(() => DispositivoESP32, { nullable: true })
  @ManyToOne(() => DispositivoESP32, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_dispositivo' })
  dispositivo?: DispositivoESP32;
}
