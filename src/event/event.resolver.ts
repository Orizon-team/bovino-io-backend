import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventosService } from './event.service';
import { Evento } from './event.entity';
import { CreateEventoInput } from './dto/create-event.input';
import { UpdateEventoInput } from './dto/update-event.input';

@Resolver(() => Evento)
export class EventosResolver {
  constructor(private eventosService: EventosService) {}

  @Query(() => [Evento])
  eventos() {
    return this.eventosService.findAll();
  }

  @Query(() => Evento, { nullable: true })
  evento(@Args('id', { type: () => Int }) id: number) {
    return this.eventosService.findOneById(id);
  }

  @Query(() => [Evento], { name: 'eventosByUser' })
  eventosByUser(@Args('id_user', { type: () => Int }) id_user: number) {
    return this.eventosService.findByUserId(id_user);
  }

  @Mutation(() => Evento)
  createEvento(@Args('input') input: CreateEventoInput) {
    return this.eventosService.create(input);
  }

  @Mutation(() => Evento)
  updateEvento(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateEventoInput) {
    return this.eventosService.update(id, input as any);
  }
}
