import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class UpdateVacaInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  tag_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_usuario?: number | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comida_preferida?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imagen?: string;
}
