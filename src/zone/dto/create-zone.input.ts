import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class CreateZoneInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;
}
