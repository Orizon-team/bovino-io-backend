import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, IClientOptions, MqttClient } from 'mqtt';
import { DetectionsIngestService } from './detections-ingest.service';
import { TagsService } from '../tags/tags.service';
import { ZoneService } from '../zone/zone.service';
import { EventosService } from '../event/event.service';
import { CowRealtimeGateway, CowRegistrationRequestPayload } from '../cows/cow-realtime.gateway';
import { Zone } from '../zone/zone.entity';
import { Tag } from '../tags/tag.entity';

@Injectable()
export class MqttDetectionsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttDetectionsListener.name);
  private client?: MqttClient;
  private detectionTopic?: string;
  private registerTopic?: string;
  private readonly processingTimers = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly ingestService: DetectionsIngestService,
    private readonly tagsService: TagsService,
    private readonly zoneService: ZoneService,
    private readonly eventosService: EventosService,
    private readonly cowGateway: CowRealtimeGateway,
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

    this.detectionTopic = topic;
    this.registerTopic = registerTopic;

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
        if (_topic === this.detectionTopic) {
          const data = JSON.parse(raw);
          await this.ingestService.processPayload(data);
          this.logger.debug(`Processed MQTT detection payload (${raw.length} bytes).`);
        } else if (_topic === this.registerTopic) {
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
    for (const timeout of this.processingTimers.values()) {
      clearTimeout(timeout);
    }
    this.processingTimers.clear();
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

    const zoneId = this.extractNumber(data, ['zone_id', 'zoneId']);
    if (zoneId === undefined || zoneId === null) {
      this.logger.warn(`register_beacon payload missing zone_id: ${rawPayload}`);
      return;
    }

    let zone: Zone | null = null;
    try {
      zone = await this.zoneService.findOneById(Number(zoneId));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Zone ${zoneId} not found for register_beacon payload: ${message}`);
      return;
    }

    const userId = zone.user?.id_user;
    const macsRaw = Array.isArray(data.macs) ? data.macs : [];
    if (!macsRaw.length) {
      this.logger.warn(`register_beacon payload missing macs array: ${rawPayload}`);
      return;
    }

    const macs = macsRaw
      .map((value: any) => (typeof value === 'string' ? value.trim() : String(value ?? '').trim()))
      .filter((mac: string) => mac.length > 0);

    if (!macs.length) {
      this.logger.warn(`register_beacon payload contains empty macs entries.`);
      return;
    }

    this.logger.log(`register_beacon recibido para zone_id=${zoneId} con ${macs.length} MAC(s).`);

    const tags: Tag[] = [];
    for (const mac of macs) {
      const tag = await this.tagsService.findByMacAddress(mac);
      if (!tag) {
        await this.createErrorEvent(userId, `No se encontró un tag para la MAC ${mac}`, 'TAG_NOT_FOUND');
        this.logger.warn(`No se encontró tag para la MAC ${mac} en zone_id=${zoneId}.`);
        continue;
      }
      tags.push(tag);
    }

    if (!tags.length) {
      this.logger.warn(`register_beacon payload macs no corresponden a tags registrados (zone_id=${zoneId}).`);
      return;
    }

    const activeTags = tags.filter((tag) => tag.status === 'active');
    if (activeTags.length) {
      this.logger.log(`Se ignoraron ${activeTags.length} tag(s) ya activos para zone_id=${zoneId}.`);
    }
    if (activeTags.length === tags.length) {
      // nothing to do, all tags already active
      return;
    }

    const processingTags = tags.filter((tag) => tag.status === 'processing');
    const unregisteredTags = tags.filter((tag) => tag.status === 'unregistered');

    if (processingTags.length > 0) {
      if (unregisteredTags.length > 0) {
        await this.createErrorEvent(
          userId,
          'Se detectó un tag sin registrar mientras existe otro en proceso de registro. Apaga los dispositivos adicionales e intenta nuevamente.',
          'TAG_REG_CONFLICT',
        );
      }
      return;
    }

    if (unregisteredTags.length > 1) {
      await this.createErrorEvent(
        userId,
        'Se detectaron múltiples tags sin registrar al mismo tiempo. Debe haber solo un tag no registrado encendido para iniciar el registro.',
        'TAG_MULTI_UNREGISTERED',
      );
      return;
    }

    if (unregisteredTags.length === 0) {
      // maybe tags already processing/active — nothing to do
      this.logger.log(`Todos los tags recibidos ya están en procesamiento o activos (zone_id=${zoneId}).`);
      return;
    }

    const targetTag = unregisteredTags[0];
    const updatedTag = await this.tagsService.update(targetTag.id, { status: 'processing' });
    this.logger.log(`Tag ${updatedTag.id} (${updatedTag.mac_address ?? 'sin MAC'}) marcado como processing para zone_id=${zoneId}.`);
    this.scheduleProcessingTimeout(updatedTag, zone, userId);

    if (!userId) {
      this.logger.warn(`Zone ${zone.id} no tiene usuario asociado; no se enviará orden de registro para tag ${updatedTag.id}.`);
      return;
    }

    const requestPayload: CowRegistrationRequestPayload = {
      tag_id: updatedTag.id,
      id_tag: updatedTag.id_tag ?? null,
      mac_address: updatedTag.mac_address ?? null,
      zone: { id: zone.id, name: zone.name },
      user: {
        id_user: userId,
        name: zone.user?.name ?? null,
        email: zone.user?.email ?? null,
      },
    };

    this.cowGateway.emitRegistrationRequest(userId, requestPayload);
    this.logger.log(`Orden de registro emitida para el usuario ${userId} (tag ${updatedTag.id}).`);
  }

  private scheduleProcessingTimeout(tag: Tag, zone: Zone, userId?: number) {
    const timeoutMs = Number(process.env.TAG_PROCESSING_TIMEOUT_MS ?? 10 * 60 * 1000);
    if (this.processingTimers.has(tag.id)) {
      clearTimeout(this.processingTimers.get(tag.id));
    }

    const timer = setTimeout(async () => {
      this.processingTimers.delete(tag.id);
      try {
        const freshTag = await this.tagsService.findOneById(tag.id);
        if (freshTag.status !== 'processing') {
          return;
        }
        await this.tagsService.update(tag.id, { status: 'unregistered' });
        const message = `Tiempo de registro agotado para el tag ${freshTag.id_tag ?? freshTag.mac_address ?? freshTag.id}. El estado se restableció a "unregistered".`;
        await this.createErrorEvent(userId, message, 'TAG_REG_TIMEOUT');
        if (userId) {
          this.cowGateway.emitRegistrationTimeout(userId, {
            tag_id: freshTag.id,
            id_tag: freshTag.id_tag ?? null,
            message,
          });
        }
        this.logger.warn(message);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`No se pudo revertir el tag ${tag.id} tras superar el tiempo de registro: ${message}`);
      }
    }, timeoutMs);

    this.processingTimers.set(tag.id, timer);
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

  private async createErrorEvent(userId: number | undefined, description: string, code: string) {
    if (!userId) {
      this.logger.warn(`No se pudo registrar evento de error (${code}): usuario indefinido.`);
      return;
    }

    const now = new Date();
    const isoDate = now.toISOString();
    const input = {
      Event_Type: 'error',
      Event_Description: description,
      Event_Code: code,
      id_user: userId,
      date: isoDate.slice(0, 10),
      time: isoDate.slice(11, 19),
    } as any;

    try {
      await this.eventosService.create(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`No se pudo registrar evento de error (${code}) para el usuario ${userId}: ${message}`);
    }
  }
}