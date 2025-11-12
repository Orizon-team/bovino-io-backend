import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateEventoInput {
  @Field()
  @IsString()
  Event_Type: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  Event_Description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  Event_Code?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_cow?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_tag?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  id_device?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  date?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  time?: string;
}
