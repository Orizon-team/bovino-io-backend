import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'PushSubscriptions' })
export class PushSubscription {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  endpoint: string;

  @Field()
  @Column('text')
  p256dh: string;

  @Field()
  @Column('text')
  auth: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  id_user?: number;

  @Field()
  @CreateDateColumn()
  created_at: Date;
}
