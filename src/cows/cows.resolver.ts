import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VacasService } from './cows.service';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';

@Resolver(() => Vaca)
export class VacasResolver {
  constructor(private vacasService: VacasService) {}

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
}
