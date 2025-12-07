import { Controller, Post, Body, Delete, Param, Query, HttpCode } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('push')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  @HttpCode(200)
  async subscribe(@Body() subscriptionData: any, @Query('userId') userId?: string) {
    const numUserId = userId ? Number(userId) : undefined;
    const subscription = await this.notificationsService.saveSubscription(subscriptionData, numUserId);
    return {
      message: 'Suscripción exitosa',
      subscriptionId: subscription.id,
    };
  }

  @Post('test')
  @HttpCode(200)
  async sendTest(@Query('userId') userId?: string) {
    const numUserId = userId ? Number(userId) : undefined;
    const result = await this.notificationsService.sendTestNotification(numUserId);
    return {
      message: 'Notificación de prueba enviada',
      ...result,
    };
  }

  @Post('send')
  @HttpCode(200)
  async sendNotification(@Body('payload') payload: any, @Query('userId') userId?: string) {
    const numUserId = userId ? Number(userId) : undefined;
    const result = await this.notificationsService.sendNotification(payload, numUserId);
    return {
      message: 'Notificación enviada',
      ...result,
    };
  }

  @Delete('unsubscribe/:endpoint')
  @HttpCode(200)
  async unsubscribe(@Param('endpoint') endpoint: string) {
    const success = await this.notificationsService.removeSubscription(decodeURIComponent(endpoint));
    return {
      message: success ? 'Desuscripción exitosa' : 'No encontrado',
      success,
    };
  }
}
