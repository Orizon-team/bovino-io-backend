import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';

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
}
