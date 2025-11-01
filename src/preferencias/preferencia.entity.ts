import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../vacas/vaca.entity';
import { Zona } from '../zona/zona.entity';

@ObjectType()
@Entity({ name: 'Preferencia' })
export class Preferencia {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Vaca)
  @ManyToOne(() => Vaca, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_vaca' })
  vaca: Vaca;

  @Field(() => Zona)
  @ManyToOne(() => Zona, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;

  @Field(() => Int)
  @Column({ type: 'int', default: 0, name: 'numero_de_visitas' })
  numero_de_visitas: number;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'ultima_visita' })
  ultima_visita?: Date;
}
