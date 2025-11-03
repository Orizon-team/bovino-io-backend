import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Zona } from '../zone/zone.entity';

@ObjectType()
@Entity({ name: 'Device_ESP32' })
export class DispositivoESP32 {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Zona, { nullable: true })
  @ManyToOne(() => Zona, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_zone' })
  zona?: Zona;

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
  @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'active' })
  status?: string;
}
