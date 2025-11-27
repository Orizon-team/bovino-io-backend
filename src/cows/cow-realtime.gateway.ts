import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CowRealtimeService } from './cow-realtime.service';

interface CowSubscribePayload {
  id: number;
}

@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class CowRealtimeGateway {
  private readonly logger = new Logger(CowRealtimeGateway.name);

  constructor(private readonly realtimeService: CowRealtimeService) {}

  @WebSocketServer()
  private server!: Server;

  @SubscribeMessage('cow.subscribe')
  async handleSubscribe(@MessageBody() payload: CowSubscribePayload, @ConnectedSocket() client: Socket) {
    const cowId = this.normalizeCowId(payload?.id);
    if (cowId === null) {
      client.emit('cow.error', { message: 'id inválido para la vaca' });
      return;
    }

    client.join(this.roomName(cowId));
    const snapshot = await this.fetchSnapshot(cowId, client);
    if (snapshot) {
      client.emit('cow.status', snapshot);
    }
  }

  @SubscribeMessage('cow.unsubscribe')
  handleUnsubscribe(@MessageBody() payload: CowSubscribePayload, @ConnectedSocket() client: Socket) {
    const cowId = this.normalizeCowId(payload?.id);
    if (cowId === null) {
      return;
    }
    client.leave(this.roomName(cowId));
  }

  @SubscribeMessage('cow.get')
  async handleGet(@MessageBody() payload: CowSubscribePayload, @ConnectedSocket() client: Socket) {
    const cowId = this.normalizeCowId(payload?.id);
    if (cowId === null) {
      client.emit('cow.error', { message: 'id inválido para la vaca' });
      return;
    }
    const snapshot = await this.fetchSnapshot(cowId, client);
    if (snapshot) {
      client.emit('cow.status', snapshot);
    }
  }

  async emitCowUpdate(cowId: number) {
    const snapshot = await this.fetchSnapshot(cowId);
    if (!snapshot) return;
    this.server.to(this.roomName(cowId)).emit('cow.status', snapshot);
  }

  private roomName(cowId: number) {
    return `cow:${cowId}`;
  }

  private normalizeCowId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.trunc(value);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value.trim());
      if (!Number.isNaN(parsed)) {
        return Math.trunc(parsed);
      }
    }
    return null;
  }

  private async fetchSnapshot(cowId: number, client?: Socket) {
    try {
      return await this.realtimeService.getCowSnapshot(cowId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`No se pudo obtener la vaca ${cowId}: ${message}`);
      if (client) {
        client.emit('cow.error', { message, id: cowId });
      }
      return null;
    }
  }
}
