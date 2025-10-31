import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  nivel_de_bateria?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_vaca?: number;

  // Usamos string ISO para la fecha/hora
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ultima_transmision?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacion_actual?: string;
}
