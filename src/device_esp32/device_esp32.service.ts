import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispositivoESP32 } from './device_esp32.entity';
import { CreateDispositivoInput } from './dto/create-device_esp32.input';

@Injectable()
export class DispositivosService {
  constructor(
    @InjectRepository(DispositivoESP32) private repo: Repository<DispositivoESP32>,
  ) {}

  async create(input: CreateDispositivoInput): Promise<DispositivoESP32> {
    // Map Spanish input fields to entity properties so they persist correctly.
    const payload: Partial<DispositivoESP32> = {};

  if (input.mac_address !== undefined) payload.mac_address = input.mac_address as string;
  if ((input as any).macAddress !== undefined) payload.mac_address = (input as any).macAddress as string;

    if (input.name !== undefined) payload.name = input.name as string;
    if ((input as any).nombre !== undefined) payload.name = (input as any).nombre as string;

    if (input.battery_level !== undefined) payload.battery_level = input.battery_level as number;
    if (input.status !== undefined) payload.status = input.status as string;

    // map spanish input names to entity column names
    if ((input as any).tipo !== undefined) {
      // entity.column 'type' is an enum ['master','slave'] — only set if value is valid
      const v = (input as any).tipo as string;
      const allowed = ['master', 'slave'];
      if (allowed.includes(v)) payload.type = v;
      // otherwise skip setting `type` so DB default is used. If you need to store
      // device model like 'esp32', consider adding a new column or extending the enum.
    }
    if ((input as any).ubicacion !== undefined) payload.location = (input as any).ubicacion as string;
    if ((input as any).ultima_actualizacion !== undefined) {
      const dte = (input as any).ultima_actualizacion;
      payload.last_update = dte instanceof Date ? dte : new Date(dte);
    }

    // associate zone by id if provided
    if ((input as any).id_zona !== undefined) {
      const zid = (input as any).id_zona;
      if (zid === null) {
        payload.zone = undefined as any;
      } else {
        // resolve actual Zone entity to avoid FK constraint errors when id doesn't exist
        const zoneRepo = this.repo.manager.getRepository('Zone');
        const zone = await zoneRepo.findOne({ where: { id: Number(zid) } });
        if (!zone) throw new NotFoundException('Zone not found');
        payload.zone = zone as any;
      }
    }

    const d = this.repo.create(payload as Partial<DispositivoESP32>);
    const saved = await this.repo.save(d);

    // Return the device with relations loaded so GraphQL can resolve nested fields
    // (e.g., zone.name which is non-nullable). If the relation doesn't exist, it
    // will be null and GraphQL will return null for `zone`.
    const withRelations = await this.repo.findOne({ where: { id: saved.id }, relations: ['zone'] });
    return withRelations ?? saved;
  }

  async findAll(): Promise<DispositivoESP32[]> {
    // include zone relation so GraphQL can resolve nested `zone` fields
    return this.repo.find({ relations: ['zone'] });
  }

  async findOneById(id: number): Promise<DispositivoESP32> {
    const d = await this.repo.findOne({ where: { id }, relations: ['zone'] });
    if (!d) throw new NotFoundException('Dispositivo no encontrado');
    return d;
  }

  async findByZone(zoneId: number): Promise<DispositivoESP32[]> {
    // find devices whose zone FK matches the provided id; include zone relation
    return this.repo.find({ where: { zone: { id: Number(zoneId) } }, relations: ['zone'] });
  }

  async update(id: number, input: Partial<DispositivoESP32> & any): Promise<DispositivoESP32> {
    const device = await this.findOneById(id);

    // Map fields similar to create mapping
  if (input.mac_address !== undefined) device.mac_address = input.mac_address;
  if (input.macAddress !== undefined) device.mac_address = input.macAddress;

    if (input.name !== undefined) device.name = input.name;
    if (input.nombre !== undefined) device.name = input.nombre;

    if (input.battery_level !== undefined) device.battery_level = input.battery_level;
    if (input.status !== undefined) device.status = input.status;

    if (input.tipo !== undefined) {
      const v = input.tipo as string;
      const allowed = ['master', 'slave'];
      if (allowed.includes(v)) device.type = v;
    }

    if (input.ubicacion !== undefined) device.location = input.ubicacion;
    if (input.ultima_actualizacion !== undefined) device.last_update = input.ultima_actualizacion instanceof Date ? input.ultima_actualizacion : new Date(input.ultima_actualizacion);

    if (input.id_zona !== undefined) {
      if (input.id_zona === null) {
        device.zone = undefined as any;
      } else {
        const zoneRepo = this.repo.manager.getRepository('Zone');
        const zone = await zoneRepo.findOne({ where: { id: Number(input.id_zona) } });
        if (!zone) throw new NotFoundException('Zone not found');
        device.zone = zone as any;
      }
    }

    const saved = await this.repo.save(device);
    const withRelations = await this.repo.findOne({ where: { id: saved.id }, relations: ['zone'] });
    return withRelations ?? saved;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.delete({ id });
    if (result.affected && result.affected > 0) return true;
    throw new NotFoundException('Dispositivo no encontrado');
  }
}
