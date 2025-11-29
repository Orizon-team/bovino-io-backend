import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, IClientOptions, MqttClient } from 'mqtt';
import { DetectionsIngestService } from './detections-ingest.service';
import { TagsService } from '../tags/tags.service';
import { CreateTagInput } from '../tags/dto/create-tag.input';

@Injectable()
export class MqttDetectionsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttDetectionsListener.name);
  private client?: MqttClient;

  constructor(
    private readonly ingestService: DetectionsIngestService,
    private readonly tagsService: TagsService,
  ) {}

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
    const topic = process.env.MQTT_TOPIC ?? 'bovino_io/detections';
    const registerTopic = process.env.MQTT_TOPIC_REGISTER ?? process.env.MQTT_TOPIC_REGISTER_BEACON ?? 'bovino_io/register_beacon';

    if (!host || (!topic && !registerTopic)) {
      this.logger.warn('MQTT host or topics not configured; skipping MQTT ingestion.');
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
      const topics = [topic, registerTopic].filter((t, idx, arr) => !!t && arr.indexOf(t) === idx) as string[];
      if (!topics.length) {
        this.logger.warn('No MQTT topics provided; skipping subscription.');
        return;
      }

      this.client?.subscribe(topics, (err, granted) => {
        if (err) {
          this.logger.error(`Failed to subscribe to MQTT topics ${topics.join(', ')}: ${err.message}`);
        } else {
          const grantedTopics = Array.isArray(granted) ? granted.map((g) => g.topic).join(', ') : topics.join(', ');
          this.logger.log(`Subscribed to MQTT topics ${grantedTopics}`);
        }
      });
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT client error: ${err.message}`, err.stack);
    });

    this.client.on('message', async (_topic, payload) => {
      const raw = payload.toString();
      try {
        if (_topic === topic) {
          const data = JSON.parse(raw);
          await this.ingestService.processPayload(data);
          this.logger.debug(`Processed MQTT detection payload (${raw.length} bytes).`);
        } else if (_topic === registerTopic) {
          await this.handleRegisterBeacon(raw);
        } else {
          this.logger.debug(`Received MQTT message on unexpected topic ${_topic}`);
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          this.logger.warn(`Invalid JSON received from MQTT (${_topic}): ${raw}`);
        } else if (err instanceof Error) {
          this.logger.error(`Failed to process MQTT payload on topic ${_topic}: ${err.message}`, err.stack);
        } else {
          this.logger.error(`Unknown error while processing MQTT payload on topic ${_topic}.`);
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

  private async handleRegisterBeacon(rawPayload: string) {
    let data: any;
    try {
      data = JSON.parse(rawPayload);
    } catch (err) {
      throw new SyntaxError(`register_beacon payload is not valid JSON: ${rawPayload}`);
    }

    if (!data || typeof data !== 'object') {
      this.logger.warn(`register_beacon payload is not an object: ${rawPayload}`);
      return;
    }

    const idTag = this.extractIdTag(data);
    if (!idTag) {
      this.logger.warn(`register_beacon payload missing id_tag: ${rawPayload}`);
      return;
    }

    const mac = this.extractString(data, ['mac_address', 'macAddress', 'mac']);
    const location = this.extractString(data, ['current_location', 'location', 'zone', 'zone_name', 'zoneName']);
    const status = this.extractString(data, ['status']) ?? 'unregistered';
    const batteryRaw = this.extractNumber(data, ['battery_level', 'battery', 'batteryLevel']);
    const lastTransmission = this.extractDate(data, ['last_transmission', 'lastTransmission', 'timestamp', 'time']);

    const existing = await this.tagsService.findByIdTag(idTag);
    if (existing) {
      const updatePayload: Record<string, any> = {};
      if (mac !== undefined) updatePayload.mac_address = mac;
      if (location !== undefined) updatePayload.current_location = location;
      if (status !== undefined) updatePayload.status = status;
      if (batteryRaw !== undefined) updatePayload.battery_level = batteryRaw;
      if (lastTransmission !== undefined) updatePayload.last_transmission = lastTransmission;

      if (Object.keys(updatePayload).length === 0) {
        this.logger.debug(`register_beacon payload for ${idTag} contained no updatable fields.`);
        return;
      }

      await this.tagsService.update(existing.id, updatePayload);
      this.logger.log(`Updated tag ${idTag} from register_beacon MQTT topic.`);
      return;
    }

    const createInput: CreateTagInput = {
      id_tag: idTag,
      mac_address: mac,
      current_location: location,
      status,
      battery_level: batteryRaw,
      last_transmission: lastTransmission,
    };

    await this.tagsService.create(createInput);
    this.logger.log(`Created tag ${idTag} from register_beacon MQTT topic.`);
  }

  private extractIdTag(data: Record<string, any>): string | undefined {
    return this.extractString(data, ['id_tag', 'idTag', 'tag_id', 'tagId', 'beacon_id', 'beaconId']);
  }

  private extractString(source: Record<string, any>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return undefined;
  }

  private extractNumber(source: Record<string, any>, keys: string[]): number | undefined {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value.trim());
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }

  private extractDate(source: Record<string, any>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = source[key];
      if (!value) continue;
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        const millis = value > 1e12 ? value : value * 1000;
        const date = new Date(millis);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        const date = new Date(value.trim());
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    }
    return undefined;
  }
}