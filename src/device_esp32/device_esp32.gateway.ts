import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DispositivoESP32 } from './device_esp32.entity';

@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class DeviceEsp32Gateway {
  @WebSocketServer()
  private server!: Server;

  emitUpdated(dispositivo: DispositivoESP32) {
    this.server.emit('device_esp32.updated', dispositivo);
  }
}
