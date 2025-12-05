import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Tag } from '../tags/tag.entity';


@ObjectType()
@Entity({ name: 'Cows' })
export class Vaca {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Field(() => Tag, { nullable: true })
  @ManyToOne(() => Tag, { nullable: false, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @Field()
  @Column({ type: 'varchar', length: 100, nullable: false, name: 'name' })
  name: string;

  @Field(() => String, { nullable: true, name: 'nombre' })
  get nombre(): string | undefined {
    return this.name;
  }

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_user' })
  user?: User;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'favorite_food' })
  favorite_food?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image' })
  image?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ear_tag' })
  ear_tag?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;
}
