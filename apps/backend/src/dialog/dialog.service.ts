import { Dialog } from '@monorepo/types';
import { Message } from '@monorepo/types';
import { DialogAndSubscriptions } from '@monorepo/types';
import { CreateDialog } from '@monorepo/types';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DIALOG_MESSAGES } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class DialogService {
    constructor(private prisma: PrismaService) {}

    // Создание диалога и отправка первого сообщения
    async createDialog(userId: string, dto: CreateDialogDto): Promise<CreateDialog> {
        try {
            return this.prisma.$transaction(async (tx) => {
                // 1️⃣ проверяем подписку
                const subscription = await tx.subscription.findUnique({
                    where: {
                        subscriberId_representativeId: {
                            subscriberId: userId,
                            representativeId: dto.representativeId,
                        },
                    },
                });

                if (!subscription) {
                    throw new ForbiddenException(DIALOG_MESSAGES.NO_SUBSCRIPTION);
                }

                // 2️⃣ ищем диалог
                let dialog = await tx.dialog.findUnique({
                    where: {
                        voterId_representativeId: {
                            voterId: userId,
                            representativeId: dto.representativeId,
                        },
                    },
                });

                // 3️⃣ если нет — создаём
                if (!dialog) {
                    dialog = await tx.dialog.create({
                        data: {
                            voterId: userId,
                            representativeId: dto.representativeId,
                        },
                    });
                }

                // 4️⃣ создаём сообщение
                const message = await tx.message.create({
                    data: {
                        dialogId: dialog.id,
                        senderId: userId,
                        text: dto.text,
                    },
                });

                // 5️⃣ получаем диалог с include
                const fullDialog = await tx.dialog.findUniqueOrThrow({
                    where: { id: dialog.id },
                    include: {
                        representative: {
                            select: {
                                id: true,
                                name: true,
                                representativeProfile: {
                                    select: { position: true },
                                },
                            },
                        },
                        voter: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });

                return {
                    dialog: fullDialog,
                    message,
                };
            });
        } catch (error) {
            logger.error(`Failed create dialog for user ${userId}`, {
                category: 'DialogService',
                operation: 'createDialog',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Получить диалоги вместе с подписками
    async getDialogsAndSubscriptions(userId: string): Promise<DialogAndSubscriptions[]> {
        try {
            // 1 Берём все диалоги пользователя
            const dialogs = await this.prisma.dialog.findMany({
                where: {
                    OR: [{ voterId: userId }, { representativeId: userId }],
                },
                include: {
                    representative: {
                        select: {
                            id: true,
                            name: true,
                            representativeProfile: { select: { position: true } },
                        },
                    },
                    voter: {
                        select: { id: true, name: true },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1, // только последнее сообщение
                        select: {
                            id: true,
                            text: true,
                            createdAt: true,
                            senderId: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });

            // Сохраняем id представителей, с которыми уже есть диалог
            const representativesWithDialog = new Set(dialogs.map((d) => d.representativeId));

            // 2 Берём подписки пользователя
            const subscriptions = await this.prisma.subscription.findMany({
                where: { subscriberId: userId },
                include: {
                    representative: {
                        select: {
                            id: true,
                            name: true,
                            representativeProfile: { select: { position: true } },
                        },
                    },
                },
            });

            // 3 Фильтруем подписки, для которых ещё нет диалога
            const subscriptionsWithoutDialog = subscriptions
                .filter((sub) => !representativesWithDialog.has(sub.representative.id))
                .map((sub) => ({
                    id: null, // нет диалога пока
                    voter: { id: userId },
                    representative: sub.representative,
                    messages: [], // сообщений пока нет
                }));

            // 4 Объединяем диалоги + подписки без диалога
            return [...dialogs, ...subscriptionsWithoutDialog];
        } catch (error) {
            logger.error(`Get dialogs and subscriptions for user ${userId}`, {
                category: 'DialogService',
                operation: 'getDialogsAndSubscriptions',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Отправить сообщение
    async createMessage(dialogId: string, userId: string, dto: CreateMessageDto): Promise<Message> {
        try {
            return this.prisma.$transaction(async (tx) => {
                const dialog = await tx.dialog.findUnique({
                    where: { id: dialogId },
                });

                if (!dialog) {
                    throw new NotFoundException(DIALOG_MESSAGES.NOT_FOUND);
                }

                const isParticipant = dialog.voterId === userId || dialog.representativeId === userId;
                if (!isParticipant) {
                    throw new ForbiddenException(DIALOG_MESSAGES.ACCESS_DENIED);
                }

                const now = new Date();

                // Создаём сообщение
                const message = await tx.message.create({
                    data: {
                        dialogId,
                        senderId: userId,
                        text: dto.text,
                    },
                });

                const updateData: { updatedAt: Date; voterLastReadAt?: Date; representativeLastReadAt?: Date } = {
                    updatedAt: now,
                };

                // Обновляем lastReadAt у отправителя
                if (dialog.voterId === userId) {
                    updateData.voterLastReadAt = now;
                } else if (dialog.representativeId === userId) {
                    updateData.representativeLastReadAt = now;
                }

                await tx.dialog.update({
                    where: { id: dialogId },
                    data: updateData,
                });

                return message;
            });
        } catch (error) {
            logger.error(`Error when creating a message for user ${userId}`, {
                category: 'DialogService',
                operation: 'createMessage',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Получить сообщения из диалога
    async getMessages(dialogId: string, userId: string, afterId?: string): Promise<Message[]> {
        try {
            const dialog = await this.prisma.dialog.findUnique({
                where: { id: dialogId },
            });

            if (!dialog) throw new NotFoundException(DIALOG_MESSAGES.NOT_FOUND);

            if (dialog.voterId !== userId && dialog.representativeId !== userId) {
                throw new ForbiddenException(DIALOG_MESSAGES.ACCESS_DENIED);
            }

            if (afterId) {
                const lastMessage = await this.prisma.message.findUnique({
                    where: { id: afterId },
                });

                if (!lastMessage) return [];

                return this.prisma.message.findMany({
                    where: {
                        dialogId,
                        createdAt: {
                            gt: lastMessage.createdAt,
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                });
            }

            return this.prisma.message.findMany({
                where: { dialogId },
                orderBy: { createdAt: 'asc' },
            });
        } catch (error) {
            logger.error(`Error get messages from dialog for user ${userId}`, {
                category: 'DialogService',
                operation: 'getMessages',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Обновить время прочтения диалга
    async updateDialogTimeRead(dialogId: string, userId: string): Promise<Dialog> {
        try {
            const dialog = await this.prisma.dialog.findUnique({
                where: { id: dialogId },
            });

            if (!dialog) {
                throw new NotFoundException(DIALOG_MESSAGES.NOT_FOUND);
            }

            let updatedDialog;

            if (dialog.voterId === userId) {
                updatedDialog = await this.prisma.dialog.update({
                    where: { id: dialogId },
                    data: { voterLastReadAt: new Date() },
                    include: {
                        representative: {
                            select: {
                                id: true,
                                name: true,
                                representativeProfile: { select: { position: true } },
                            },
                        },
                        voter: { select: { id: true, name: true } },
                        messages: { orderBy: { createdAt: 'asc' } },
                    },
                });
            } else if (dialog.representativeId === userId) {
                updatedDialog = await this.prisma.dialog.update({
                    where: { id: dialogId },
                    data: { representativeLastReadAt: new Date() },
                    include: {
                        representative: {
                            select: {
                                id: true,
                                name: true,
                                representativeProfile: { select: { position: true } },
                            },
                        },
                        voter: { select: { id: true, name: true } },
                        messages: { orderBy: { createdAt: 'asc' } }, // приходят все сообщения каждый раз, не очень хорошо
                    },
                });
            } else {
                throw new ForbiddenException(DIALOG_MESSAGES.ACCESS_DENIED);
            }

            return updatedDialog;
        } catch (error) {
            logger.error(`Error update time read dialog for user ${userId}`, {
                category: 'DialogService',
                operation: 'updateDialogTimeRead',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
