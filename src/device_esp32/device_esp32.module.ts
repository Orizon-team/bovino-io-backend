import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoESP32 } from './device_esp32.entity';
import { DispositivosService } from './device_esp32.service';
import { DispositivosResolver } from './device_esp32.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoESP32])],
  providers: [DispositivosService, DispositivosResolver],
  exports: [DispositivosService],
})
export class DispositivosModule {}
