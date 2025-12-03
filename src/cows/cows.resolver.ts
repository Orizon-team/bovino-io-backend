import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VacasService } from './cows.service';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';
import { UpdateVacaInput } from './dto/update-cow.input';
import { CowRealtimeGateway, CowRegistrationRequestPayload } from './cow-realtime.gateway';

@Resolver(() => Vaca)
export class VacasResolver {
  constructor(private vacasService: VacasService, private cowGateway: CowRealtimeGateway) {}

  @Query(() => [Vaca])
  vacas() {
    return this.vacasService.findAll();
  }

  @Query(() => Vaca)
  vaca(@Args('id', { type: () => Int }) id: number) {
    return this.vacasService.findOneById(id);
  }

  @Mutation(() => Vaca)
  createVaca(@Args('input') input: CreateVacaInput) {
    return this.vacasService.create(input);
  }

  @Mutation(() => Vaca)
  updateVaca(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateVacaInput) {
    return this.vacasService.update(id, input as any);
  }

  @Query(() => [Vaca])
  vacasByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.vacasService.findByUserId(userId);
  }

  @Mutation(() => Boolean)
  deleteVaca(@Args('id', { type: () => Int }) id: number) {
    return this.vacasService.remove(id);
  }

  @Mutation(() => Boolean, { description: 'Temporal: dispara manualmente cow.registration.request' })
  testCowRegistration(
    @Args('id_user', { type: () => Int }) id_user: number,
    @Args('tag_id', { type: () => Int }) tag_id: number,
    @Args('zone_id', { type: () => Int }) zone_id: number,
    @Args('zone_name', { type: () => String }) zone_name: string,
    @Args('user_name', { type: () => String, nullable: true }) user_name?: string,
    @Args('user_email', { type: () => String, nullable: true }) user_email?: string,
    @Args('id_tag', { type: () => String, nullable: true }) id_tag?: string,
    @Args('mac_address', { type: () => String, nullable: true }) mac_address?: string,
    @Args('redirect_url', { type: () => String, nullable: true }) redirect_url?: string,
  ) {
    const payload: CowRegistrationRequestPayload = {
      tag_id,
      id_tag,
      mac_address,
      zone: { id: zone_id, name: zone_name },
      user: { id_user, name: user_name ?? null, email: user_email ?? null },
      redirect_url,
    };
    this.cowGateway.emitRegistrationRequest(id_user, payload);
    return true;
  }
}
