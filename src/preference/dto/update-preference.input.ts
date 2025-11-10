import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt } from 'class-validator';

@InputType()
export class UpdatePreferenciaInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_cow?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_zone?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  visit_count?: number;

  @Field({ nullable: true })
  @IsOptional()
  last_visit?: Date;
}
