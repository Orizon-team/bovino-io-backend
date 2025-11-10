import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class UpdateEventoInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  Event_Type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  Event_Description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_cow?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_tag?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id_device?: number | null;
}
