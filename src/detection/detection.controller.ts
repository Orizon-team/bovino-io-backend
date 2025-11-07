import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { DeteccionesService } from './detection.service';

@Controller('detections')
export class DeteccionesController {
  constructor(private deteccionesService: DeteccionesService) {}

  @Post('bulk')
  async receiveBulk(@Body() body: any) {
    try {
      const saved = await this.deteccionesService.processDevicePayload(body);
      return { count: saved.length, records: saved };
    } catch (err) {
      throw new BadRequestException(err.message || 'Invalid payload');
    }
  }
}
