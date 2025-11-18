import { Body, Controller, Post } from '@nestjs/common';
import { DetectionsIngestService } from './detections-ingest.service';

@Controller('detections')
export class DetectionsController {
  constructor(
    private readonly ingestService: DetectionsIngestService,
  ) {}

  @Post('ingest')
  async ingest(@Body() payload: any) {
    return this.ingestService.processPayload(payload);
  }
}
