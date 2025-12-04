import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class TagLocationInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
}
