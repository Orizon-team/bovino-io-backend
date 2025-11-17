import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateDispositivoInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_zona?: number;

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

  @Field({ nullable: true })
  @IsOptional()
  battery_level?: number;

  @Field({ nullable: true })
  @IsOptional()
  status?: string;
}
