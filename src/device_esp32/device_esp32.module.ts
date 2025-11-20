import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoESP32 } from './device_esp32.entity';
import { DispositivosService } from './device_esp32.service';
import { DispositivosResolver } from './device_esp32.resolver';
import { DeviceEsp32Gateway } from './device_esp32.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoESP32])],
  providers: [DispositivosService, DispositivosResolver, DeviceEsp32Gateway],
  exports: [DispositivosService, DeviceEsp32Gateway],
})
export class DispositivosModule {}
