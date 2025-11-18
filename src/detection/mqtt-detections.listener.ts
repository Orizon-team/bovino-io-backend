import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, IClientOptions, MqttClient } from 'mqtt';
import { DetectionsIngestService } from './detections-ingest.service';

@Injectable()
export class MqttDetectionsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttDetectionsListener.name);
  private client?: MqttClient;

  constructor(private readonly ingestService: DetectionsIngestService) {}

  onModuleInit() {
    const enabled = (process.env.MQTT_ENABLED ?? 'true').toLowerCase();
    if (enabled === 'false' || enabled === '0') {
      this.logger.log('MQTT ingestion disabled by MQTT_ENABLED flag.');
      return;
    }

    const host = process.env.MQTT_HOST ?? '621de91008c745099bb8eb28731701af.s1.eu.hivemq.cloud';
    const port = Number(process.env.MQTT_PORT ?? '8883');
    const username = process.env.MQTT_USERNAME ?? 'orizoncompany';
    const password = process.env.MQTT_PASSWORD ?? 'UzObFn33';
  const topic = process.env.MQTT_TOPIC ?? 'bovino_io';

    if (!host || !topic) {
      this.logger.warn('MQTT host or topic not configured; skipping MQTT ingestion.');
      return;
    }

    const protocol = port === 8883 ? 'mqtts' : 'mqtt';
    const url = `${protocol}://${host}:${port}`;

    const options: IClientOptions = {
      username,
      password,
      reconnectPeriod: 5000,
      keepalive: 60,
      clean: true,
    };

    this.client = connect(url, options);

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker ${url}`);
      this.client?.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to MQTT topic ${topic}: ${err.message}`);
        } else {
          this.logger.log(`Subscribed to MQTT topic ${topic}`);
        }
      });
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT client error: ${err.message}`, err.stack);
    });

    this.client.on('message', async (_topic, payload) => {
      const raw = payload.toString();
      try {
        const data = JSON.parse(raw);
        await this.ingestService.processPayload(data);
        this.logger.debug(`Processed MQTT detection payload (${raw.length} bytes).`);
      } catch (err) {
        if (err instanceof SyntaxError) {
          this.logger.warn(`Invalid JSON received from MQTT: ${raw}`);
        } else if (err instanceof Error) {
          this.logger.error(`Failed to process MQTT payload: ${err.message}`, err.stack);
        } else {
          this.logger.error('Unknown error while processing MQTT payload.');
        }
      }
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.logger.log('Disconnecting from MQTT broker...');
      this.client.end(true);
      this.client = undefined;
    }
  }
}