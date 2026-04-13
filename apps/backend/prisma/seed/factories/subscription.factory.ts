import { faker } from '@faker-js/faker/locale/ru';
import { PrismaClient, User } from '@prisma/client';

/**
 * Создаёт подписку voter → representative.
 *
 * Правила:
 * - [subscriberId, representativeId] уникальная пара (ограничение на уровне БД)
 * - subscriberId — VOTER, representativeId — REPRESENTATIVE
 */
export async function createSubscription(prisma: PrismaClient, subscriberId: string, representativeId: string) {
    return prisma.subscription.create({
        data: {
            subscriberId,
            representativeId,
        },
    });
}

/**
 * Создаёт подписки для всех VOTER.
 * Каждый VOTER подписывается на 1–3 случайных REPRESENTATIVE.
 *
 * Возвращает Map<voterId, representativeId[]> — используется для создания Dialog.
 */
export async function createSubscriptionsForVoters(
    prisma: PrismaClient,
    voters: User[],
    representatives: User[],
): Promise<Map<string, string[]>> {
    const subscriptionMap = new Map<string, string[]>();

    for (const voter of voters) {
        const count = faker.number.int({ min: 1, max: Math.min(3, representatives.length) });
        const shuffled = faker.helpers.shuffle([...representatives]);
        const chosen = shuffled.slice(0, count);

        const repsForVoter: string[] = [];
        for (const rep of chosen) {
            try {
                await createSubscription(prisma, voter.id, rep.id);
                repsForVoter.push(rep.id);
            } catch {
                // Игнорируем дублирующиеся подписки (unique constraint)
            }
        }
        if (repsForVoter.length > 0) {
            subscriptionMap.set(voter.id, repsForVoter);
        }
    }

    return subscriptionMap;
}
