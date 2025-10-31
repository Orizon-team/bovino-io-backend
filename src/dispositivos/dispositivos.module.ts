import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoESP32 } from './dispositivo.entity';
import { DispositivosService } from './dispositivos.service';
import { DispositivosResolver } from './dispositivos.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoESP32])],
  providers: [DispositivosService, DispositivosResolver],
  exports: [DispositivosService],
})
export class DispositivosModule {}
