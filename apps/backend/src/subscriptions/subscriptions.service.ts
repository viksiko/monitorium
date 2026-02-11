// subscriptions/subscriptions.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { USER_NOT_FOUND_MSG } from '@src/constants/api-messages.constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
    constructor(private readonly prisma: PrismaService) {}

    async subscribe(
        subscriberId: string,
        representativeId: string,
    ): Promise<{ message: string }> {
        if (subscriberId === representativeId) {
            throw new BadRequestException('Нельзя подписаться на самого себя');
        }

        // Проверяем, что пользователь существует и он представитель
        const targetUser = await this.prisma.user.findUnique({
            where: { id: representativeId },
            select: { role: true },
        });

        if (!targetUser) {
            throw new NotFoundException(USER_NOT_FOUND_MSG);
        }

        if (targetUser.role !== 'REPRESENTATIVE') {
            throw new BadRequestException(
                'Подписка возможна только на представителя власти',
            );
        }

        // Проверка на существующую подписку
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: {
                subscriberId_representativeId: {
                    subscriberId,
                    representativeId,
                },
            },
        });

        if (existingSubscription) {
            throw new BadRequestException(
                'Вы уже подписаны на этого представителя',
            );
        }

        await this.prisma.subscription.create({
            data: {
                subscriberId,
                representativeId,
            },
        });

        return { message: 'Подписка успешно оформлена' };
    }

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
