import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vaca } from '../vacas/vaca.entity';

@ObjectType()
@Entity({ name: 'Tag' })
export class Tag {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'nivel_de_bateria' })
  nivel_de_bateria?: number;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_vaca' })
  vaca?: Vaca;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'ultima_transmision' })
  ultima_transmision?: Date;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'bateria_baja', 'perdido'], default: 'activo' })
  status?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ubicacion_actual' })
  ubicacion_actual?: string;
}
