import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BalanceTransactionType } from '@prisma/client';
import { BalanceService } from '@src/balance/balance.service';
import { SUBSCRIPTION_MESSAGES, USER_NOT_FOUND } from '@src/constants/api-messages.constants';
import { TOKEN_PARAMS } from '@src/constants/tokens-params';
import { NotificationService } from '@src/notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly balanceService: BalanceService,
        private readonly notificationService: NotificationService,
    ) {}

    async subscribe(subscriberId: string, representativeId: string): Promise<{ message: string }> {
        if (subscriberId === representativeId) {
            throw new BadRequestException(SUBSCRIPTION_MESSAGES.SELF_SUBSCRIPTION);
        }

        // Проверяем, что пользователь существует и он представитель
        const targetUser = await this.prisma.user.findUnique({
            where: { id: representativeId },
            select: { role: true },
        });

        if (!targetUser) {
            throw new NotFoundException(USER_NOT_FOUND);
        }

        if (targetUser.role !== 'REPRESENTATIVE') {
            throw new BadRequestException(SUBSCRIPTION_MESSAGES.INVALID_TARGET);
        }

        const subscription = await this.prisma.$transaction(async (tx) => {
            // Проверка на существующую подписку (уже внутри транзакции)
            const existingSubscription = await tx.subscription.findUnique({
                where: {
                    subscriberId_representativeId: {
                        subscriberId,
                        representativeId,
                    },
                },
            });

            if (existingSubscription) {
                throw new BadRequestException(SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED);
            }

            // Создаём подписку
            const subscription = await tx.subscription.create({
                data: {
                    subscriberId,
                    representativeId,
                },
            });

            // Начисляем бонусные билеты
            await this.balanceService.depositBalanceTx(
                tx,
                subscriberId,
                TOKEN_PARAMS.REPRESENTATIVE_SUBSCRIPTION_PRICE,
                BalanceTransactionType.REPRESENTATIVE_SUBSCRIPTION,
            );

            return subscription;
        });

        // создаём уведомление представителю по websocket
        await this.notificationService.createAndSendNotification({
            userId: representativeId,
            type: 'NEW_SUBSCRIBER',
            title: 'Новый подписчик',
            message: 'На вас подписался новый пользователь',
            subscriptionId: subscription.id,
        });

        return { message: SUBSCRIPTION_MESSAGES.CREATE_SUCCESS };
    }

    // async getUserSubscriptions(userId: string) {
    //     return this.prisma.subscription.findMany({
    //         where: {
    //             subscriberId: userId,
    //         },
    //         orderBy: {
    //             createdAt: 'desc',
    //         },
    //         include: {
    //             representative: {
    //                 select: {
    //                     id: true,
    //                     name: true,
    //                     role: true,
    //                     representativeProfile: {
    //                         select: {
    //                             position: true,
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     });
    // }

    // async unsubscribe(userId: string, representativeUserId: string) {
    //     const voterProfile = await this.prisma.voterProfile.findUnique({
    //         where: { userId },
    //     });

    //     if (!voterProfile) {
    //         throw new BadRequestException('Вы не избиратель');
    //     }

    //     const representativeProfile =
    //         await this.prisma.representativeProfile.findUnique({
    //             where: { userId: representativeUserId },
    //         });

    //     if (!representativeProfile) {
    //         throw new NotFoundException('Представитель не найден');
    //     }

    //     return this.prisma.subscription.delete({
    //         where: {
    //             userProfileId_representativeId: {
    //                 userProfileId: voterProfile.id,
    //                 representativeId: representativeProfile.id,
    //             },
    //         },
    //     });
    // }
}
