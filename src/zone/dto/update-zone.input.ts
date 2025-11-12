import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class UpdateZoneInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_user?: number | null;

}
