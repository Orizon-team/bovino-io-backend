import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class CreateVacaInput {
  @Field()
  @IsString()
  @Length(1, 100)
  tag_id: number;

  @Field()
  @IsString()
  nombre: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_usuario?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comida_preferida?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imagen?: string;
}
