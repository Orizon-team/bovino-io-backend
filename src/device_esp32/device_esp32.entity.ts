import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Zone } from '../zone/zone.entity';

@ObjectType()
@Entity({ name: 'Device_ESP32' })
export class DispositivoESP32 {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Zone, { nullable: true })
  @ManyToOne(() => Zone, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_zone' })
  zone?: Zone;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 17, nullable: true, name: 'mac_address' })
  mac_address?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name' })
  name?: string;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['master', 'slave'], default: 'master', name: 'type' })
  type?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'location' })
  location?: string;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_update' })
  last_update?: Date;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'battery_level' })
  battery_level?: number;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['active', 'inactive', 'error', 'pending'], default: 'active', name: 'status' })
  status?: string;
}
