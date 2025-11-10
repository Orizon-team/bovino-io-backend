import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PreferenciasService } from './preference.service';
import { Preferencia } from './preference.entity';
import { CreatePreferenciaInput } from './dto/create-preference.input';
import { UpdatePreferenciaInput } from './dto/update-preference.input';

@Resolver(() => Preferencia)
export class PreferenciasResolver {
  constructor(private prefService: PreferenciasService) {}

  @Query(() => [Preferencia])
  preferencias() {
    return this.prefService.findAll();
  }

  @Query(() => Preferencia)
  preferencia(@Args('id', { type: () => Int }) id: number) {
    return this.prefService.findOneById(id);
  }

  @Mutation(() => Preferencia)
  createPreferencia(@Args('input') input: CreatePreferenciaInput) {
    return this.prefService.create(input);
  }

  @Mutation(() => Preferencia)
  updatePreferencia(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdatePreferenciaInput) {
    return this.prefService.update(id, input as any);
  }
}
