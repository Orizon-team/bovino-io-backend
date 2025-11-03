import { Resolver, Query } from '@nestjs/graphql';
import { ZonaService } from './zone.service';
import { Zona } from './zone.entity';

@Resolver(() => Zona)
export class ZonaResolver {
  constructor(private zonaService: ZonaService) {}

  @Query(() => [Zona])
  zonas() {
    return this.zonaService.findAll();
  }
}
