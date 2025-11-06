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
  device: DispositivoESP32;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'distance' })
  distance?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true, name: 'rssi' })
  rssi?: number;

  @Field(() => Boolean)
  @Column({ type: 'tinyint', width: 1, default: 1, name: 'is_present' })
  is_present: boolean;

  @Field({ nullable: true })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'first_seen' })
  first_seen?: Date;

  @Field({ nullable: true })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'last_seen' })
  last_seen?: Date;
}
