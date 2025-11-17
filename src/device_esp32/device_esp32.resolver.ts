import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DispositivosService } from './device_esp32.service';
import { DispositivoESP32 } from './device_esp32.entity';
import { CreateDispositivoInput } from './dto/create-device_esp32.input';
import { UpdateDispositivoInput } from './dto/update-device_esp32.input';

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

  @Query(() => [DispositivoESP32], { name: 'dispositivosByZone' })
  dispositivosByZone(@Args('id_zone', { type: () => Int }) id_zone: number) {
    return this.dispositivosService.findByZone(id_zone);
  }

  @Mutation(() => DispositivoESP32)
  createDispositivo(@Args('input') input: CreateDispositivoInput) {
    return this.dispositivosService.create(input);
  }

  @Mutation(() => DispositivoESP32)
  updateDispositivo(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateDispositivoInput) {
    return this.dispositivosService.update(id, input as any);
  }

  @Mutation(() => Boolean)
  deleteDispositivo(@Args('id', { type: () => Int }) id: number) {
    return this.dispositivosService.remove(id);
  }
}
