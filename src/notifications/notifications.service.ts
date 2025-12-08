import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';
import { EventosService } from '../event/event.service';
import { CreateEventoInput } from '../event/dto/create-event.input';

interface SubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface SubscriptionPayload {
  endpoint: string;
  keys: SubscriptionKeys;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptionRepo: Repository<PushSubscription>,
    private readonly eventosService: EventosService,
  ) {
    this.configureVapid();
  }

  private configureVapid() {
    const subject = process.env.VAPID_SUBJECT || 'mailto:noreply@bovino-io.com';
    const publicKey = process.env.VAPID_PUBLIC_KEY || '';
    const privateKey = process.env.VAPID_PRIVATE_KEY || '';

    if (!publicKey || !privateKey) {
      this.logger.warn('VAPID keys are not configured; push notifications will fail.');
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  async saveSubscription(subscriptionData: SubscriptionPayload, userId?: number): Promise<PushSubscription> {
    const { endpoint, keys } = subscriptionData;

    let subscription = await this.subscriptionRepo.findOne({ where: { endpoint } });

    if (subscription) {
      subscription.id_user = userId;
      return this.subscriptionRepo.save(subscription);
    }

    subscription = this.subscriptionRepo.create({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      id_user: userId,
    });

    return this.subscriptionRepo.save(subscription);
  }

  async sendNotification(payload: unknown, userId?: number): Promise<{ success: number; failed: number }> {
    const subscriptions = userId
      ? await this.subscriptionRepo.find({ where: { id_user: userId } })
      : await this.subscriptionRepo.find();

    let success = 0;
    let failed = 0;

    if (!subscriptions.length) {
      return { success, failed };
    }

    const pushPayload = JSON.stringify(payload ?? {});

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload,
        );
        success += 1;
      } catch (error: any) {
        failed += 1;
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await this.subscriptionRepo.delete(sub.id);
        }
        this.logger.warn(`Error enviando notificación a ${sub.endpoint}: ${error?.message ?? error}`);
      }
    }

    if (success > 0) {
      const targetUserIds = this.resolveEventUserIds(userId, subscriptions);
      await Promise.all(targetUserIds.map((targetUserId) => this.recordNotificationEvent(payload, targetUserId)));
    }

    return { success, failed };
  }

  async sendTestNotification(userId?: number): Promise<{ success: number; failed: number }> {
    const payload = {
      title: '✅ Notificación de Prueba',
      body: 'Esta es una notificación de prueba desde tu API Bovino IO',
      icon: '/pwa-192.svg',
      badge: '/pwa-192.svg',
      tag: 'test-notification',
      data: {
        url: '/',
        type: 'test',
      },
    };

    return this.sendNotification(payload, userId);
  }

  async removeSubscription(endpoint: string): Promise<boolean> {
    const result = await this.subscriptionRepo.delete({ endpoint });
    return (result.affected ?? 0) > 0;
  }

  private resolveEventUserIds(explicitUserId: number | undefined, subscriptions: PushSubscription[]): Array<number | undefined> {
    if (typeof explicitUserId === 'number') {
      return [explicitUserId];
    }

    const unique = new Set<number>();
    for (const sub of subscriptions) {
      if (typeof sub.id_user === 'number') {
        unique.add(sub.id_user);
      }
    }

    return unique.size > 0 ? Array.from(unique) : [undefined];
  }

  private async recordNotificationEvent(rawPayload: unknown, userId?: number) {
    try {
      const normalized = this.normalizePayloadForEvent(rawPayload);
      const now = new Date();
      const iso = now.toISOString();
      const [date, timeWithMs] = iso.split('T');
      const time = timeWithMs ? timeWithMs.slice(0, 8) : undefined;

      const input: CreateEventoInput = {
        Event_Type: normalized.type,
        Event_Description: normalized.description,
        Event_Code: normalized.code,
        id_user: userId,
        id_cow: normalized.cowId,
        tag_id: normalized.tagId,
        date,
        time,
      };

      await this.eventosService.create(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to persist notification event: ${message}`);
    }
  }

  private normalizePayloadForEvent(rawPayload: unknown) {
    const fallback = {
      type: 'notification',
      description: 'Notificación enviada',
      code: undefined as string | undefined,
      cowId: undefined as number | undefined,
      tagId: undefined as number | undefined,
    };

    if (!rawPayload || typeof rawPayload !== 'object') {
      if (typeof rawPayload === 'string' && rawPayload.trim().length > 0) {
        fallback.description = rawPayload.trim();
      }
      return fallback;
    }

    const payload = rawPayload as Record<string, any>;
    const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
    const tag = typeof payload.tag === 'string' && payload.tag.trim().length > 0 ? payload.tag.trim() : undefined;
    const typeCandidate = typeof data.type === 'string' && data.type.trim().length > 0 ? data.type.trim() : undefined;

    const eventType = this.resolveEventType(typeCandidate, tag);

    return {
      type: eventType,
      description: this.pickDescription(payload) ?? fallback.description,
      code: tag,
      cowId: this.toOptionalNumber(data.cowId ?? data.id_cow),
      tagId: this.toOptionalNumber(data.tagId ?? data.tag_id),
    };
  }

  private pickDescription(payload: Record<string, any>): string | undefined {
    const body = typeof payload.body === 'string' && payload.body.trim().length > 0 ? payload.body.trim() : undefined;
    if (body) {
      return body;
    }
    const title = typeof payload.title === 'string' && payload.title.trim().length > 0 ? payload.title.trim() : undefined;
    return title;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value.trim());
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private resolveEventType(dataType?: string, tag?: string) {
    const normalizedType = dataType?.toLowerCase();
    const normalizedTag = tag?.toLowerCase();

    if (normalizedType === 'tag_multi_unregistered' || normalizedTag === 'tag-registration-alert') {
      return 'critical';
    }

    if (normalizedType === 'cow_out_of_range' || normalizedTag?.startsWith('cow-out-of-range')) {
      return 'warning';
    }

    if (normalizedType === 'test' || normalizedTag === 'test-notification') {
      return 'success';
    }

    return 'success';
  }
}
