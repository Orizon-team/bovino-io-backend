import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { TagLocationInput } from './tag-location.input';

@InputType()
export class UpdateTagInput {
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  last_transmission?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => TagLocationInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => TagLocationInput)
  current_location?: TagLocationInput;
}
