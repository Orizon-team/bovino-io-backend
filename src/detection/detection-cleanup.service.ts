import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Deteccion } from './detection.entity';
import { Vaca } from '../cows/cow.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CowRealtimeGateway } from '../cows/cow-realtime.gateway';

@Injectable()
export class DetectionCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DetectionCleanupService.name);
  private readonly outOfRangeNotifications = new Map<number, number>();

  constructor(
    @InjectRepository(Deteccion) private readonly deteccionRepo: Repository<Deteccion>,
    @InjectRepository(Vaca) private readonly cowsRepo: Repository<Vaca>,
    private readonly notificationsService: NotificationsService,
    private readonly cowRealtimeGateway: CowRealtimeGateway,
  ) {}

  onModuleInit() {
    this.logger.log('DetectionCleanupService initialized; scheduled cleanup every minute.');
  }

  onModuleDestroy() {
    this.logger.log('DetectionCleanupService destroyed.');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await Promise.all([this.detectOutOfRangeCows(), this.cleanupDetectionsTable()]);
  }

  private async cleanupDetectionsTable() {
    try {
      const res = await this.deteccionRepo.createQueryBuilder().delete().execute();
      this.logger.debug(`Deleted detections rows; result: ${JSON.stringify(res)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to clean detections table: ${message}`);
    }
  }

  private async detectOutOfRangeCows() {
    const outOfRangeMinutes = this.resolveMinutes(process.env.COW_OUT_OF_RANGE_MINUTES, 3);
    const cooldownMinutes = this.resolveMinutes(process.env.COW_OUT_OF_RANGE_COOLDOWN_MINUTES, 5);
    const threshold = new Date(Date.now() - outOfRangeMinutes * 60 * 1000);

    try {
      const cows = await this.cowsRepo
        .createQueryBuilder('cow')
        .leftJoinAndSelect('cow.tag', 'tag')
        .leftJoinAndSelect('cow.user', 'user')
        .where('tag.id IS NOT NULL')
        .andWhere(new Brackets((qb) => qb.where('tag.last_transmission IS NULL').orWhere('tag.last_transmission < :threshold', { threshold })))
        .getMany();

      await Promise.all(
        cows.map(async (cow) => {
          const userId = cow.user?.id_user;
          if (!userId) {
            return;
          }
          if (!this.canSendOutOfRange(cow.id, cooldownMinutes)) {
            return;
          }

          const lastTransmission = cow.tag?.last_transmission ?? null;
          const minutesWithoutSignalRaw = lastTransmission
            ? (Date.now() - new Date(lastTransmission).getTime()) / 60000
            : null;
          const minutesWithoutSignal = minutesWithoutSignalRaw !== null
            ? Math.max(0, Math.round(minutesWithoutSignalRaw))
            : null;

          const payload = {
            title: '⚠️ Vaca fuera de rango',
            body: minutesWithoutSignal
              ? `${cow.name ?? 'Una de tus vacas'} lleva ${minutesWithoutSignal} min sin detecciones.`
              : `${cow.name ?? 'Una de tus vacas'} aún no reporta detecciones en la zona asignada.`,
            tag: `cow-out-of-range-${cow.id}`,
            data: {
              type: 'cow_out_of_range',
              cowId: cow.id,
              last_seen: lastTransmission ? new Date(lastTransmission).toISOString() : null,
              current_location: cow.tag?.current_location ?? null,
              threshold_minutes: outOfRangeMinutes,
            },
          };

          const result = await this.notificationsService.sendNotification(payload, userId);
          this.logger.log(
            `Out-of-range alert for cow ${cow.id} sent to user ${userId}. success=${result.success}, failed=${result.failed}`,
          );
          this.outOfRangeNotifications.set(cow.id, Date.now());

          try {
            await this.cowRealtimeGateway.emitCowUpdate(cow.id);
          } catch (gatewayErr) {
            const message = gatewayErr instanceof Error ? gatewayErr.message : String(gatewayErr);
            this.logger.warn(`Failed to broadcast cow ${cow.id} out-of-range update: ${message}`);
          }
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to evaluate out-of-range cows: ${message}`);
    }
  }

  private resolveMinutes(value: string | number | undefined, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(1, Math.floor(value));
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value.trim());
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return Math.max(1, Math.floor(parsed));
      }
    }
    return fallback;
  }

  private canSendOutOfRange(cowId: number, cooldownMinutes: number) {
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const lastSent = this.outOfRangeNotifications.get(cowId);
    if (!lastSent) {
      return true;
    }
    return Date.now() - lastSent >= cooldownMs;
  }
}
