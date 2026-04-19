import { Module } from '@nestjs/common';
import { BalanceModule } from '@src/balance/balance.module';
import { DialogController } from './dialog.controller';
import { DialogService } from './dialog.service';

@Module({
    imports: [BalanceModule],
    controllers: [DialogController],
    providers: [DialogService],
})
export class DialogModule {}
