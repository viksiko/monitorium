import { Notification, NotificationItem } from '@monorepo/types';
import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller({
    path: 'notifications',
    version: '1',
})
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiOperation({ summary: 'Получить все уведомления пользователя' })
    async getNotifications(@Req() req: Request & { user: User }): Promise<NotificationItem[]> {
        return this.notificationService.getNotifications(req.user.id);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
    async readNotification(@Param('id') id: string, @Req() req: Request & { user: User }): Promise<Notification> {
        return this.notificationService.readNotification(id, req.user.id);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
    async readAllNotifications(@Req() @Req() req: Request & { user: User }): Promise<void> {
        return this.notificationService.readAllNotifications(req.user.id);
    }
}
