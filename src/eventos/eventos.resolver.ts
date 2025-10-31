import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventosService } from './eventos.service';
import { Evento } from './evento.entity';
import { CreateEventoInput } from './dto/create-evento.input';

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

  @Mutation(() => Evento)
  createEvento(@Args('input') input: CreateEventoInput) {
    return this.eventosService.create(input);
  }
}
