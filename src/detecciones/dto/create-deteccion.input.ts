import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateDeteccionInput {
  @Field(() => Int)
  id_tag: number;

  @Field(() => Int)
  id_dispositivo: number;

  @Field({ nullable: true })
  @IsOptional()
  fecha?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  intensidad_senal?: number;
}
