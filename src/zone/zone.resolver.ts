import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ZoneService } from './zone.service';
import { Zone } from './zone.entity';
import { CreateZoneInput } from './dto/create-zone.input';
import { UpdateZoneInput } from './dto/update-zone.input';

// Added query to fetch zones by user id

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

  @Query(() => [Zone])
  zonesByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.zoneService.findByUserId(userId);
  }

  @Mutation(() => Zone)
  updateZone(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateZoneInput) {
    return this.zoneService.update(id, input as any);
  }

  @Mutation(() => Zone)
  createZone(@Args('input') input: CreateZoneInput) {
    return this.zoneService.create(input);
  }
}
