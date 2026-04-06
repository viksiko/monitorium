import { Module } from '@nestjs/common';
import { BalanceService } from '@src/balance/balance.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, BalanceService],
})
export class SubscriptionsModule {}
