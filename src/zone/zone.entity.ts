import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'Zone' })
export class Zona {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'name' })
  nombre: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'description' })
  descripcion?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'location' })
  ubicacion?: string;
}
