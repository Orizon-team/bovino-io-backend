import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DeteccionesService } from './detection.service';
import { Deteccion } from './detection.entity';
import { CreateDeteccionInput } from './dto/create-detection.input';
import { UpdateDeteccionInput } from './dto/update-detection.input';
import { SimulateDetectionsInput } from './dto/ingest-detections.input';
import { SimulateDetectionsResult } from './dto/ingest-detections.result';
import { DetectionsIngestService } from './detections-ingest.service';

@Resolver(() => Deteccion)
export class DeteccionesResolver {
  constructor(
    private readonly detService: DeteccionesService,
    private readonly ingestService: DetectionsIngestService,
  ) {}

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

  @Mutation(() => SimulateDetectionsResult, { description: 'Simula el payload recibido por MQTT para pruebas manuales.' })
  async simulateDetections(@Args('input') input: SimulateDetectionsInput): Promise<SimulateDetectionsResult> {
    const payload = this.buildIngestPayload(input);
    const result = await this.ingestService.processPayload(payload);
    return { count: result.count, detections: result.detections };
  }

  private buildIngestPayload(input: SimulateDetectionsInput) {
    return {
      mac_address: input.mac_address,
      device_id: input.device_id,
      zone_name: input.zone_name,
      detections: input.detections.map((det) => ({
        mac_address: det.mac_address,
        device_location: det.device_location,
        first_seen: det.first_seen,
        last_seen: det.last_seen,
        distance: det.distance,
        rssi: det.rssi,
        is_present: det.is_present,
      })),
    };
  }
}
