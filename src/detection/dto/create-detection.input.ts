import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsInt, IsNumber } from 'class-validator';

@InputType()
export class CreateDeteccionInput {
  @Field(() => Int)
  id_tag: number;

  @Field(() => Int)
  id_device: number;

  @Field({ nullable: true })
  @IsOptional()
  fecha?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  intensidad_senal?: number;
}
