import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DeteccionesService } from './detection.service';
import { Deteccion } from './detection.entity';
import { CreateDeteccionInput } from './dto/create-detection.input';
import { UpdateDeteccionInput } from './dto/update-detection.input';

@Resolver(() => Deteccion)
export class DeteccionesResolver {
  constructor(private detService: DeteccionesService) {}

  @Query(() => [Deteccion])
  detecciones() {
    return this.detService.findAll();
  }

  @Query(() => Deteccion)
  deteccion(@Args('id', { type: () => Int }) id: number) {
    return this.detService.findOneById(id);
  }

  @Mutation(() => Deteccion)
  createDeteccion(@Args('input') input: CreateDeteccionInput) {
    return this.detService.create(input);
  }

  @Mutation(() => Deteccion)
  updateDeteccion(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateDeteccionInput) {
    return this.detService.update(id, input as any);
  }
}
