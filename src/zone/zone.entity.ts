import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'Zone' })
export class Zone {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 100, name: 'name' })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'location' })
  location?: string;
}
