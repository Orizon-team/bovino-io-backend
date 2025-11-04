import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ZoneService } from './zone.service';
import { Zone } from './zone.entity';
import { CreateZoneInput } from './dto/create-zone.input';

@Resolver(() => Zone)
export class ZoneResolver {
  constructor(private zoneService: ZoneService) {}

  @Query(() => [Zone])
  zones() {
    return this.zoneService.findAll();
  }

  @Query(() => Zone)
  zone(@Args('id', { type: () => Int }) id: number) {
    return this.zoneService.findOneById(id);
  }

  @Mutation(() => Zone)
  createZone(@Args('input') input: CreateZoneInput) {
    return this.zoneService.create(input);
  }
}
