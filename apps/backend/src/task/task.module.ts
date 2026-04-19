import { Module } from '@nestjs/common';
import { BalanceModule } from '@src/balance/balance.module';
import { NotificationModule } from '@src/notification/notification.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
    providers: [TaskService],
    controllers: [TaskController],
    imports: [NotificationModule, BalanceModule],
})
export class TaskModule {}
