import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DispositivosService } from './dispositivos.service';
import { DispositivoESP32 } from './dispositivo.entity';
import { CreateDispositivoInput } from './dto/create-dispositivo.input';

@Resolver(() => DispositivoESP32)
export class DispositivosResolver {
  constructor(private dispositivosService: DispositivosService) {}

  @Query(() => [DispositivoESP32])
  dispositivos() {
    return this.dispositivosService.findAll();
  }

  @Query(() => DispositivoESP32)
  dispositivo(@Args('id', { type: () => Int }) id: number) {
    return this.dispositivosService.findOneById(id);
  }

  @Mutation(() => DispositivoESP32)
  createDispositivo(@Args('input') input: CreateDispositivoInput) {
    return this.dispositivosService.create(input);
  }
}
