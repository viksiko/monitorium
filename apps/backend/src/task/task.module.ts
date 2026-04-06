import { Module } from '@nestjs/common';
import { BalanceService } from '@src/balance/balance.service';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
    providers: [TaskService, BalanceService],
    controllers: [TaskController],
})
export class TaskModule {}
