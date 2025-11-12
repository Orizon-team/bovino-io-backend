import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Length, IsInt } from 'class-validator';

@InputType()
export class CreateZoneInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name: string;


  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_user?: number;
}
