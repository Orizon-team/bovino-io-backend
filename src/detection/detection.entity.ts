import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';

@ObjectType()
@Entity({ name: 'Detection' })
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
  @JoinColumn({ name: 'id_device' })
  dispositivo: DispositivoESP32;

  @Field({ nullable: true })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'date' })
  fecha: Date;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'signal_strength' })
  intensidad_senal?: number;
}
