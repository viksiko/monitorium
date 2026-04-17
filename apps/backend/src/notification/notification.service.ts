import { Notification, NotificationItem, NotificationType } from '@monorepo/types';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) {}

    // создание записи в таблице уведомлений и отправвка
    async createAndSendNotification(data: {
        userId: string;
        type: NotificationType;
        title?: string;
        message?: string;
        subscriptionId?: string;
        taskId?: string;
        postId?: string;
    }): Promise<Notification> {
        const notification = await this.prisma.notification.create({
            data,
        });

        // отправка уведомления в реальном времени
        this.notificationsGateway.sendNotification(data.userId, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
        });

        return notification;
    }

    // Получить все уведомления пользователя
    async getNotifications(userId: string): Promise<NotificationItem[]> {
        return this.prisma.notification.findMany({
            where: {
                userId,
                isRead: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                subscription: {
                    include: {
                        subscriber: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                task: {
                    select: {
                        title: true,
                    },
                },
                post: {
                    select: {
                        title: true,
                        author: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Отметить как прочитанное
    async readNotification(notificationId: string, userId: string): Promise<Notification> {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        // защита — нельзя читать чужие уведомления
        if (notification.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
            },
        });
    }

    // прочитать все уведомления
    async readAllNotifications(userId: string): Promise<void> {
        await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }
}
