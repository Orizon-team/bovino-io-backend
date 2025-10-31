import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateEventoInput {
  @Field()
  @IsString()
  Tipo_Evento: string;

  @Field({ nullable: true })
  @IsOptional()
  Descripcion_Evento?: string;

  @Field({ nullable: true })
  @IsOptional()
  fecha?: string;

  @Field({ nullable: true })
  @IsOptional()
  hora?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_vaca?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_tag?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_dispositivo?: number;
}
