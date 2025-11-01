import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ZonaService } from './zona.service';
import { Zona } from './zona.entity';
import { CreateZonaInput } from './dto/create-zona.input';

@Resolver(() => Zona)
export class ZonaResolver {
  constructor(private zonaService: ZonaService) {}

  @Query(() => [Zona])
  zonas() {
    return this.zonaService.findAll();
  }

  @Query(() => Zona)
  zona(@Args('id', { type: () => Int }) id: number) {
    return this.zonaService.findOneById(id);
  }

  @Mutation(() => Zona)
  createZona(@Args('input') input: CreateZonaInput) {
    return this.zonaService.create(input);
  }
}
