import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationsGatwayModule } from './notification.gateway.module';
import { NotificationService } from './notification.service';

@Module({
    imports: [NotificationsGatwayModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
