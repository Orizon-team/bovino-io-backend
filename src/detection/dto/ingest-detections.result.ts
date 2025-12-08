import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Deteccion } from '../detection.entity';

@ObjectType()
export class SimulateDetectionsResult {
  @Field(() => Int)
  count: number;

  @Field(() => [Deteccion])
  detections: Deteccion[];
}
