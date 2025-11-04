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
  zona?: Zone;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['primary', 'child'], default: 'primary', name: 'type' })
  tipo?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion?: string;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_update' })
  ultima_actualizacion?: Date;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'battery_level' })
  nivel_de_bateria?: number;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'error'], default: 'activo' })
  status?: string;
}
