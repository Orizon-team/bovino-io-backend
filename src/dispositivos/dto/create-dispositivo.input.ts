import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class CreateDispositivoInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_zona?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tipo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @Field({ nullable: true })
  @IsOptional()
  ultima_actualizacion?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  nivel_de_bateria?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
