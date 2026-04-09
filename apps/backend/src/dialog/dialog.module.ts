import { Module } from '@nestjs/common';
import { BalanceService } from '@src/balance/balance.service';
import { DialogController } from './dialog.controller';
import { DialogService } from './dialog.service';

@Module({
    controllers: [DialogController],
    providers: [DialogService, BalanceService],
})
export class DialogModule {}
