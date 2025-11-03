import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';

@ObjectType()
@Entity({ name: 'Tag' })
export class Tag {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, name: 'battery_level' })
  nivel_de_bateria?: number;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cow' })
  vaca?: Vaca;

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_transmission' })
  ultima_transmision?: Date;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: ['active', 'inactive', 'low_battery', 'lost'], default: 'active' })
  status?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'current_location' })
  ubicacion_actual?: string;
}
