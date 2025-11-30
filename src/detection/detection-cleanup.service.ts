import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deteccion } from './detection.entity';

@Injectable()
export class DetectionCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DetectionCleanupService.name);

  constructor(
    @InjectRepository(Deteccion) private readonly deteccionRepo: Repository<Deteccion>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.logger.log('DetectionCleanupService initialized; scheduled cleanup every minute.');
  }

  onModuleDestroy() {
    this.logger.log('DetectionCleanupService destroyed.');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const res = await this.deteccionRepo.createQueryBuilder().delete().execute();
      // res.affected may be undefined for some drivers; log summary
      this.logger.debug(`Deleted detections rows; result: ${JSON.stringify(res)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to clean detections table: ${message}`);
    }
  }
}
