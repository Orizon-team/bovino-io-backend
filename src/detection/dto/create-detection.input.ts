import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsInt, IsNumber, IsBoolean } from 'class-validator';

@InputType()
export class CreateDeteccionInput {
  @Field(() => Int)
  @IsInt()
  tag_id: number;

  @Field(() => Int)
  @IsInt()
  id_device: number;

  @Field({ nullable: true })
  @IsOptional()
  fecha?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  intensidad_senal?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  distance?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  rssi?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  is_present?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  first_seen?: Date;

  @Field({ nullable: true })
  @IsOptional()
  last_seen?: Date;
}
