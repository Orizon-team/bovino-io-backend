import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';
import { Zone } from '../zone/zone.entity';

@ObjectType()
@Entity({ name: 'Preference' })
export class Preferencia {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_cow' })
  cow?: Vaca;

  @Field(() => Vaca, { nullable: true, name: 'vaca' })
  get vaca(): Vaca | undefined {
    return this.cow;
  }

  @Field(() => Zone, { nullable: true })
  @ManyToOne(() => Zone, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'id_zone' })
  zone?: Zone;

  @Field(() => Zone, { nullable: true, name: 'zona' })
  get zona(): Zone | undefined {
    return this.zone;
  }

  @Field(() => Int)
  @Column({ type: 'int', default: 0, name: 'visit_count' })
  visit_count: number;

  @Field(() => Int, { name: 'numero_de_visitas' })
  get numeroDeVisitas(): number {
    return this.visit_count;
  }

  @Field({ nullable: true })
  @Column({ type: 'datetime', nullable: true, name: 'last_visit' })
  last_visit?: Date;

  @Field(() => String, { nullable: true, name: 'ultima_visita' })
  get ultimaVisita(): string | undefined {
    if (!this.last_visit) return undefined;
    // return ISO string for GraphQL clients
    return this.last_visit instanceof Date ? this.last_visit.toISOString() : String(this.last_visit);
  }
}
