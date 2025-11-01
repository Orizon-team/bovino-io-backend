import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Zona } from '../zona/zona.entity';

@ObjectType()
@Entity({ name: 'Dispositivo_ESP32' })
export class DispositivoESP32 {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Zona, { nullable: true })
  @ManyToOne(() => Zona, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_zona' })
  zona?: Zona;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['principal', 'hijo'], default: 'principal' })
  tipo?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion?: string;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'ultima_actualizacion' })
  ultima_actualizacion?: Date;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'nivel_de_bateria' })
  nivel_de_bateria?: number;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['activo', 'inactivo', 'error'], default: 'activo' })
  status?: string;
}
