import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CowRealtimeService } from './cow-realtime.service';

interface CowSubscribePayload {
  id: number;
}

interface UserSubscribePayload {
  id_user: number;
}

export interface CowRegistrationRequestPayload {
  tag_id: number;
  id_tag?: string | null;
  mac_address?: string | null;
  zone: { id: number; name: string };
  user: { id_user: number; name?: string | null; email?: string | null };
  redirect_url?: string;
}

export interface CowRegistrationTimeoutPayload {
  tag_id: number;
  id_tag?: string | null;
  message: string;
}

@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class CowRealtimeGateway {
  private readonly logger = new Logger(CowRealtimeGateway.name);
  private readonly registrationUrl = process.env.FRONTEND_CATTLE_URL ?? 'http://localhost:5173/dashboard/cattle';

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

  @SubscribeMessage('user.subscribe')
  handleUserSubscribe(@MessageBody() payload: UserSubscribePayload, @ConnectedSocket() client: Socket) {
    const userId = this.normalizeUserId(payload?.id_user);
    if (userId === null) {
      client.emit('cow.error', { message: 'id_usuario inválido', scope: 'user' });
      return;
    }
    client.join(this.userRoom(userId));
  }

  @SubscribeMessage('user.unsubscribe')
  handleUserUnsubscribe(@MessageBody() payload: UserSubscribePayload, @ConnectedSocket() client: Socket) {
    const userId = this.normalizeUserId(payload?.id_user);
    if (userId === null) {
      return;
    }
    client.leave(this.userRoom(userId));
  }

  emitRegistrationRequest(userId: number, payload: CowRegistrationRequestPayload) {
    const normalizedUserId = this.normalizeUserId(userId);
    if (normalizedUserId === null) {
      this.logger.warn(`emitRegistrationRequest ignorado: id_user inválido (${userId})`);
      return;
    }
    const enrichedPayload: CowRegistrationRequestPayload = {
      ...payload,
      redirect_url: payload.redirect_url ?? this.registrationUrl,
    };
    this.server.to(this.userRoom(normalizedUserId)).emit('cow.registration.request', enrichedPayload);
  }

  emitRegistrationTimeout(userId: number, payload: CowRegistrationTimeoutPayload) {
    const normalizedUserId = this.normalizeUserId(userId);
    if (normalizedUserId === null) return;
    this.server.to(this.userRoom(normalizedUserId)).emit('cow.registration.timeout', payload);
  }

  private roomName(cowId: number) {
    return `cow:${cowId}`;
  }

  private userRoom(userId: number) {
    return `user:${userId}`;
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

  private normalizeUserId(value: unknown): number | null {
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
