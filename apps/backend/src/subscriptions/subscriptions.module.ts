import { Module } from '@nestjs/common';
import { BalanceModule } from '@src/balance/balance.module';
import { NotificationModule } from '@src/notification/notification.module';
import { SubscriptionController } from './subscriptions.controller';
import { SubscriptionService } from './subscriptions.service';

@Module({
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
    imports: [NotificationModule, BalanceModule],
})
export class SubscriptionModule {}
