import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';

@InputType()
export class UpdateDispositivoInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_zona?: number | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

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
  ultima_actualizacion?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  battery_level?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
