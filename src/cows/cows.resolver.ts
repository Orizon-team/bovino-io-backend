import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VacasService } from './cows.service';
import { Vaca } from './cow.entity';
import { CreateVacaInput } from './dto/create-cow.input';
import { UpdateVacaInput } from './dto/update-cow.input';

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
}
