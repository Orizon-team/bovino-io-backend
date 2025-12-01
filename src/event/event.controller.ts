import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { EventosService } from './event.service';

@Controller('events')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const ok = await this.eventosService.remove(id);
    return { success: ok };
  }
}
