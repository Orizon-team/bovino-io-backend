import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PreferenciasService } from './preferencias.service';
import { Preferencia } from './preferencia.entity';
import { CreatePreferenciaInput } from './dto/create-preferencia.input';

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
}
