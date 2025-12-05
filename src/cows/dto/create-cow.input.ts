import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class CreateVacaInput {
  @Field(() => Int)
  @IsInt()
  tag_id: number;

  @Field()
  @IsString()
  @Length(1, 100)
  nombre: string;

  @Field()
  @IsString()
  @Length(1, 100)
  ear_tag: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
