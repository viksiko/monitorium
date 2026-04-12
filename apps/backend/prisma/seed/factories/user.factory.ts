import { faker } from '@faker-js/faker/locale/ru';
import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

export interface UserSeedInput {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    districtId?: string;
    phone?: string;
    isRepresentative?: boolean;
    isVerified?: boolean;
    isActive?: boolean;
}

/**
 * Создаёт одного пользователя в БД.
 *
 * Правила:
 * - password всегда хешируется bcrypt(rounds=10), как в UserService.createUser
 * - isVerified и isActive = true по умолчанию (seed обходит email-верификацию)
 * - REPRESENTATIVE: isRepresentative=true, districtId обязателен
 * - VOTER: isRepresentative=false, districtId не нужен
 * - Возвращает объект вместе с plainPassword для записи в seed-output.json
 */
export async function createUser(
    prisma: PrismaClient,
    input: UserSeedInput = {},
): Promise<{ user: Awaited<ReturnType<PrismaClient['user']['create']>>; plainPassword: string }> {
    const role = input.role ?? Role.VOTER;
    const plainPassword = input.password ?? faker.internet.password({ length: 12, memorable: false }) + 'A1!';
    const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

    const isRepresentative = input.isRepresentative ?? role === Role.REPRESENTATIVE;

    const user = await prisma.user.create({
        data: {
            name: input.name ?? faker.person.fullName(),
            email: input.email ?? faker.internet.email().toLowerCase(),
            phone: input.phone ?? null,
            password: hashedPassword,
            role,
            districtId: input.districtId ?? null,
            isRepresentative,
            isVerified: input.isVerified ?? true,
            isActive: input.isActive ?? role !== Role.REPRESENTATIVE,
        },
    });

    return { user, plainPassword };
}

/**
 * Создаёт нескольких VOTER-пользователей.
 */
export async function createVoters(
    prisma: PrismaClient,
    count: number,
): Promise<Array<{ user: Awaited<ReturnType<PrismaClient['user']['create']>>; plainPassword: string }>> {
    const results: Array<{ user: Awaited<ReturnType<PrismaClient['user']['create']>>; plainPassword: string }> = [];
    for (let i = 0; i < count; i++) {
        const result = await createUser(prisma, { role: Role.VOTER });
        results.push(result);
    }
    return results;
}

/**
 * Создаёт нескольких REPRESENTATIVE-пользователей.
 * districtIds — список доступных ID округов (выбирается случайный)
 */
export async function createRepresentatives(
    prisma: PrismaClient,
    count: number,
    districtIds: string[],
): Promise<Array<{ user: Awaited<ReturnType<PrismaClient['user']['create']>>; plainPassword: string }>> {
    const results: Array<{ user: Awaited<ReturnType<PrismaClient['user']['create']>>; plainPassword: string }> = [];
    for (let i = 0; i < count; i++) {
        const districtId = faker.helpers.arrayElement(districtIds);
        const result = await createUser(prisma, {
            role: Role.REPRESENTATIVE,
            districtId,
            isActive: true,
            isVerified: true,
        });
        results.push(result);
    }
    return results;
}
