import { NotificationItem } from '@monorepo/types';
import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_NOTIFICATION_ID_READ } from '@src/constants/swagger/api-param.swagger';
import {
    GET_ALL_NOTIFICATIONS,
    NOTIFICATION_ACCESS_FORBIDDEN,
    NOTIFICATION_NOT_FOUND,
    NOTIFICATION_READ,
    NOTIFICATIONS_READ_ALL,
} from '@src/constants/swagger/notification-responses.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'notifications',
    version: '1',
})
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiOperation({ summary: 'Получить все уведомления пользователя' })
    @ApiResponse(GET_ALL_NOTIFICATIONS)
    async getNotifications(@Req() req: Request & { user: User }): Promise<NotificationItem[]> {
        return this.notificationService.getNotifications(req.user.id);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
    @ApiResponse(NOTIFICATION_READ)
    @ApiResponse(NOTIFICATION_ACCESS_FORBIDDEN)
    @ApiResponse(NOTIFICATION_NOT_FOUND)
    @ApiParam(PARAM_NOTIFICATION_ID_READ)
    async readNotification(
        @Param('id') id: string,
        @Req() req: Request & { user: User },
    ): Promise<{ message: string }> {
        return this.notificationService.readNotification(id, req.user.id);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
    @ApiResponse(NOTIFICATIONS_READ_ALL)
    async readAllNotifications(@Req() @Req() req: Request & { user: User }): Promise<{ message: string }> {
        return this.notificationService.readAllNotifications(req.user.id);
    }
}
