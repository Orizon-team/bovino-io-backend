import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreatePreferenciaInput {
  @Field(() => Int)
  id_vaca: number;

  @Field(() => Int)
  id_zona: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  numero_de_visitas?: number;

  @Field({ nullable: true })
  @IsOptional()
  ultima_visita?: string;
}
