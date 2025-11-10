import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../users/user.entity';

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

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_user' })
  user?: User;
}
