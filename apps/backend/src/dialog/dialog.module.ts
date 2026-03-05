import { Module } from '@nestjs/common';
import { DialogController } from './dialog.controller';
import { DialogService } from './dialog.service';

@Module({
    controllers: [DialogController],
    providers: [DialogService],
})
export class DialogModule {}
