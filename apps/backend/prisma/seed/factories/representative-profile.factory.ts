import { faker } from '@faker-js/faker/locale/ru';
import { PrismaClient, RepresentativeProfile } from '@prisma/client';

const POSITIONS = [
    'Депутат городской думы',
    'Глава района',
    'Депутат областной думы',
    'Заместитель главы района',
    'Председатель комитета',
];

const PARTIES = ['Единая Россия', 'ЛДПР', 'КПРФ', 'Справедливая Россия', 'Новые люди', null, null];

export interface RepresentativeProfileInput {
    position?: string;
    party?: string | null;
    bio?: string | null;
    rating?: number;
    tasksTotal?: number;
    tasksCompleted?: number;
    attendance?: number;
}

/**
 * Создаёт RepresentativeProfile для пользователя с ролью REPRESENTATIVE.
 *
 * Правила:
 * - position обязателен
 * - tasksTotal/tasksCompleted заполняются нулями при создании,
 *   пересчитываются в seed.ts после создания Task
 * - rating: 0.0–5.0
 * - attendance: 0.0–100.0 (процент посещаемости)
 */
export async function createRepresentativeProfile(
    prisma: PrismaClient,
    userId: string,
    input: RepresentativeProfileInput = {},
) {
    return prisma.representativeProfile.create({
        data: {
            userId,
            position: input.position ?? faker.helpers.arrayElement(POSITIONS),
            party: input.party !== undefined ? input.party : faker.helpers.arrayElement(PARTIES),
            bio: input.bio !== undefined ? input.bio : faker.lorem.sentences(2),
            rating: input.rating ?? faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
            tasksTotal: input.tasksTotal ?? 0,
            tasksCompleted: input.tasksCompleted ?? 0,
            attendance: input.attendance ?? faker.number.float({ min: 40, max: 100, fractionDigits: 1 }),
            lastActivity: faker.date.recent({ days: 30 }),
        },
    });
}

/**
 * Создаёт RepresentativeProfile для нескольких пользователей.
 */
export async function createRepresentativeProfiles(
    prisma: PrismaClient,
    userIds: string[],
    inputs: RepresentativeProfileInput[] = [],
) {
    const profiles: RepresentativeProfile[] = [];
    for (let i = 0; i < userIds.length; i++) {
        const profile = await createRepresentativeProfile(prisma, userIds[i], inputs[i] ?? {});
        profiles.push(profile);
    }
    return profiles;
}
