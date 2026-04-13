import { PrismaClient, VoterProfile } from '@prisma/client';

const REGISTRATION_BONUS = 10;

/**
 * Создаёт VoterProfile для пользователя с ролью VOTER.
 *
 * Правила:
 * - balance = 10 (регистрационный бонус, как в AuthService.confirmRegistration)
 * - Связь 1-1 с User: userId уникален
 */
export async function createVoterProfile(prisma: PrismaClient, userId: string, balance: number = REGISTRATION_BONUS) {
    return prisma.voterProfile.create({
        data: {
            userId,
            balance,
        },
    });
}

/**
 * Создаёт VoterProfile для нескольких пользователей.
 */
export async function createVoterProfiles(prisma: PrismaClient, userIds: string[]) {
    const profiles: VoterProfile[] = [];
    for (const userId of userIds) {
        const profile = await createVoterProfile(prisma, userId);
        profiles.push(profile);
    }
    return profiles;
}
