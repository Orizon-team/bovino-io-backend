import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vaca } from '../cows/cow.entity';
import { Tag } from '../tags/tag.entity';
import { DispositivoESP32 } from '../device_esp32/device_esp32.entity';

@ObjectType()
@Entity({ name: 'Event' })
export class Evento {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id_event: number;

  @Field(() => Int, { name: 'Codigo_Evento' })
  get codigoEvento(): number {
    return this.id_event;
  }

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'Event_Code' })
  Event_Code?: string;

  @Field({ nullable: true, name: 'Descripcion_Evento' })
  get descripcionEvento(): string | undefined {
    return this.Event_Description;
  }

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'Event_Type' })
  Event_Type?: string;

  @Field({ nullable: true, name: 'Tipo_Evento' })
  get tipoEvento(): string | undefined {
    return this.Event_Type;
  }

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, name: 'Event_Description' })
  Event_Description?: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true, name: 'time' })
  time?: string;

  @Field({ nullable: true, name: 'hora' })
  get hora(): string | undefined {
    return this.time;
  }

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true, name: 'date' })
  date?: string;

  @Field({ nullable: true, name: 'fecha' })
  get fecha(): string | undefined {
    return this.date;
  }

  @Field(() => Vaca, { nullable: true })
  @ManyToOne(() => Vaca, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_cow' })
  cow?: Vaca;

  @Field(() => Vaca, { nullable: true, name: 'vaca' })
  get vaca(): Vaca | undefined {
    return this.cow;
  }

  @Field(() => Tag, { nullable: true })
  @ManyToOne(() => Tag, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_tag' })
  tag?: Tag;

  @Field(() => DispositivoESP32, { nullable: true })
  @ManyToOne(() => DispositivoESP32, { nullable: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_device' })
  device?: DispositivoESP32;

  @Field(() => DispositivoESP32, { nullable: true, name: 'dispositivo' })
  get dispositivo(): DispositivoESP32 | undefined {
    return this.device;
  }
}
