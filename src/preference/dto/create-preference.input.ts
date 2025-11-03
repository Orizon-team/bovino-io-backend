import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt } from 'class-validator';

@InputType()
export class CreatePreferenciaInput {
  @Field(() => Int)
  id_cow: number;

  @Field(() => Int)
  id_zone: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  visit_count?: number;

  @Field({ nullable: true })
  @IsOptional()
  last_visit?: Date;
}
