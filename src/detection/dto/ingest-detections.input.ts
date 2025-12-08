import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SimulatedDetectionInput {
  @Field()
  @IsString()
  @MaxLength(64)
  mac_address: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  device_location?: string;

  @Field({ nullable: true })
  @IsOptional()
  first_seen?: Date;

  @Field({ nullable: true })
  @IsOptional()
  last_seen?: Date;

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
}

@InputType()
export class SimulateDetectionsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mac_address?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  device_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zone_name?: string;

  @Field(() => [SimulatedDetectionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulatedDetectionInput)
  detections: SimulatedDetectionInput[];
}
