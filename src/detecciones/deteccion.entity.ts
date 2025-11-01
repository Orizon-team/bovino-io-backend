import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../dispositivos/dispositivo.entity';

@ObjectType()
@Entity({ name: 'Deteccion' })
export class Deteccion {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Tag)
  @ManyToOne(() => Tag, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_tag' })
  tag: Tag;

  @Field(() => DispositivoESP32)
  @ManyToOne(() => DispositivoESP32, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_dispositivo' })
  dispositivo: DispositivoESP32;

  @Field({ nullable: true })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'intensidad_senal' })
  intensidad_senal?: number;
}
