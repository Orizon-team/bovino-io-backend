import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VacasService } from './cows.service';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';
import { UpdateVacaInput } from './dto/update-cow.input';
import { CowRealtimeGateway, CowRegistrationRequestPayload } from './cow-realtime.gateway';
import { TagsService } from '../tags/tags.service';
import { ZoneService } from '../zone/zone.service';

@Resolver(() => Vaca)
export class VacasResolver {
  constructor(
    private vacasService: VacasService,
    private cowGateway: CowRealtimeGateway,
    private tagsService: TagsService,
    private zoneService: ZoneService,
  ) {}

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
  async testCowRegistration(
    @Args('id_user', { type: () => Int }) id_user: number,
    @Args('tag_id', { type: () => Int }) tag_id: number,
    @Args('zone_id', { type: () => Int }) zone_id: number,
    @Args('zone_name', { type: () => String, nullable: true }) zone_name?: string,
    @Args('user_name', { type: () => String, nullable: true }) user_name?: string,
    @Args('user_email', { type: () => String, nullable: true }) user_email?: string,
    @Args('id_tag', { type: () => String, nullable: true }) id_tag?: string,
    @Args('mac_address', { type: () => String, nullable: true }) mac_address?: string,
    @Args('redirect_url', { type: () => String, nullable: true }) redirect_url?: string,
  ) {
    const tag = await this.tagsService.findOneById(tag_id);
    if (tag.status === 'unregistered') {
      await this.tagsService.update(tag.id, { status: 'processing' } as any);
    }

    const zone = await this.zoneService.findOneById(zone_id);
    const finalZoneName = zone?.name ?? zone_name ?? `Zona ${zone_id}`;
    const finalUserName = user_name ?? zone.user?.name ?? null;
    const finalUserEmail = user_email ?? zone.user?.email ?? null;

    const payload: CowRegistrationRequestPayload = {
      tag_id: tag.id,
      id_tag: tag.id_tag ?? id_tag ?? null,
      mac_address: tag.mac_address ?? mac_address ?? null,
      zone: { id: zone_id, name: finalZoneName },
      user: { id_user, name: finalUserName, email: finalUserEmail },
      redirect_url,
    };
    this.cowGateway.emitRegistrationRequest(id_user, payload);
    return true;
  }
}
