import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  id_tag?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mac_address?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  battery_level?: number;

  // ISO date/time string
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  last_transmission?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  current_location?: string;
}
