import { faker } from '@faker-js/faker/locale/ru';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { createBalanceTransactionsForVoter } from './factories/balance-transaction.factory';
import { createCommentsForPost, createCommentsForTask } from './factories/comment.factory';
import { createDialogsFromSubscriptions } from './factories/dialog.factory';
import { seedDistricts } from './factories/district.factory';
import { createMessagesForDialog } from './factories/message.factory';
import { seedNotifications } from './factories/notification.factory';
import { createPostsForRepresentatives } from './factories/post.factory';
import { createRepresentativeProfiles } from './factories/representative-profile.factory';
import { createSubscription, createSubscriptionsForVoters } from './factories/subscription.factory';
import { createTaskStages } from './factories/task-stage.factory';
import { createGuaranteedTasksForVoters, createTasksForVoters } from './factories/task.factory';
import { createRepresentatives, createVoters } from './factories/user.factory';
import { createVoterProfiles } from './factories/voter-profile.factory';

// ─── Конфигурация ────────────────────────────────────────────────────────────
const SEED_DATA_PATH = path.join(__dirname, 'seed-data.json');
const SEED_OUTPUT_PATH = path.join(__dirname, 'seed-output.json');

const CONFIG = {
    generatedVotersCount: 20,
    generatedRepresentativesCount: 5,
    tasksCount: 30,
    postsCount: 15,
} as const;
// ─────────────────────────────────────────────────────────────────────────────

interface SeedUser {
    name: string;
    email: string;
    password: string;
    role: string;
    districtName?: string;
    position?: string;
    party?: string;
    bio?: string;
    subscribeTo?: string[]; // email'ы представителей, на которых подписан этот voter
}

interface SeedData {
    users: SeedUser[];
}

interface OutputUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
    console.log('🌱 Начинаем сидинг...\n');

    // ─── 1. Загрузка seed-data.json ─────────────────────────────────────────
    const seedData: SeedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
    const outputUsers: OutputUser[] = [];

    // ─── 2. Сидинг округов ──────────────────────────────────────────────────
    console.log('📍 Создаём округа и территории...');
    const districts = await seedDistricts(prisma);
    const districtIds = districts.map((d) => d.id);
    console.log(`   ✓ Создано/обновлено ${districts.length} округов\n`);

    // ─── 3. Создание пользователей из seed-data.json ────────────────────────
    console.log('👤 Создаём пользователей из seed-data.json...');
    const preloadedVoters: User[] = [];
    const preloadedRepresentatives: User[] = [];

    for (const seedUser of seedData.users) {
        let districtId: string | undefined;
        if (seedUser.districtName) {
            const district = districts.find((d) => d.name === seedUser.districtName);
            if (!district) {
                console.warn(`   ⚠  Округ "${seedUser.districtName}" не найден для ${seedUser.email}`);
            } else {
                districtId = district.id;
            }
        }

        const role = seedUser.role as Role;
        const hashedPassword = await bcrypt.hash(seedUser.password, 10);
        const isRepresentative = role === Role.REPRESENTATIVE;

        const existing = await prisma.user.findUnique({ where: { email: seedUser.email } });
        let user: User;
        if (existing) {
            user = existing;
            console.log(`   ⏭  Уже есть (не меняем пароль в БД): ${user.email} [${user.role}]`);
        } else {
            user = await prisma.user.create({
                data: {
                    name: seedUser.name,
                    email: seedUser.email,
                    password: hashedPassword,
                    role,
                    districtId: districtId ?? null,
                    isRepresentative,
                    isVerified: true,
                    isActive: true,
                },
            });
            console.log(`   ✓ Создан: ${user.email} [${user.role}]`);
        }

        outputUsers.push({
            id: user.id,
            name: user.name,
            email: user.email,
            password: seedUser.password,
            role: user.role,
        });

        if (user.role === Role.VOTER) preloadedVoters.push(user);
        if (user.role === Role.REPRESENTATIVE) preloadedRepresentatives.push(user);
    }
    console.log();

    // ─── 4. Генерация VOTER ─────────────────────────────────────────────────
    console.log(`🗳  Генерируем ${CONFIG.generatedVotersCount} VOTER...`);
    const generatedVoterResults = await createVoters(prisma, CONFIG.generatedVotersCount);
    const generatedVoters = generatedVoterResults.map((r) => r.user);
    generatedVoterResults.forEach((r) => {
        outputUsers.push({
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
            password: r.plainPassword,
            role: r.user.role,
        });
    });
    console.log(`   ✓ Создано ${generatedVoters.length} избирателей\n`);

    const allVoters = [...preloadedVoters, ...generatedVoters];

    // ─── 5. Генерация REPRESENTATIVE ────────────────────────────────────────
    console.log(`🏛  Генерируем ${CONFIG.generatedRepresentativesCount} REPRESENTATIVE...`);
    const generatedRepResults = await createRepresentatives(prisma, CONFIG.generatedRepresentativesCount, districtIds);
    const generatedReps = generatedRepResults.map((r) => r.user);
    generatedRepResults.forEach((r) => {
        outputUsers.push({
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
            password: r.plainPassword,
            role: r.user.role,
        });
    });
    console.log(`   ✓ Создано ${generatedReps.length} представителей\n`);

    const allRepresentatives = [...preloadedRepresentatives, ...generatedReps];

    // ─── 6. VoterProfile ────────────────────────────────────────────────────
    console.log('💼 Создаём VoterProfile...');
    const votersWithoutProfile = await filterUsersWithoutProfile(prisma, allVoters, 'voter');
    await createVoterProfiles(
        prisma,
        votersWithoutProfile.map((u) => u.id),
    );
    console.log(`   ✓ Создано ${votersWithoutProfile.length} VoterProfile\n`);

    // ─── 7. RepresentativeProfile ───────────────────────────────────────────
    console.log('👔 Создаём RepresentativeProfile...');
    const repsWithoutProfile = await filterUsersWithoutProfile(prisma, allRepresentatives, 'representative');

    const preloadedRepInputs = seedData.users
        .filter((u) => u.role === 'REPRESENTATIVE')
        .map((u) => ({ position: u.position, party: u.party, bio: u.bio }));

    // Для preloaded представителей используем данные из seed-data, для остальных — faker
    const preloadedRepsFiltered = repsWithoutProfile.filter((u) => preloadedRepresentatives.some((p) => p.id === u.id));
    const generatedRepsFiltered = repsWithoutProfile.filter(
        (u) => !preloadedRepresentatives.some((p) => p.id === u.id),
    );

    if (preloadedRepsFiltered.length > 0) {
        await createRepresentativeProfiles(
            prisma,
            preloadedRepsFiltered.map((u) => u.id),
            preloadedRepInputs,
        );
    }
    if (generatedRepsFiltered.length > 0) {
        await createRepresentativeProfiles(
            prisma,
            generatedRepsFiltered.map((u) => u.id),
        );
    }
    console.log(`   ✓ Создано ${repsWithoutProfile.length} RepresentativeProfile\n`);

    const allUsers = [...allVoters, ...allRepresentatives];

    // Словарь для быстрого поиска представителей по id и email
    const representativesById = new Map(allRepresentatives.map((r) => [r.id, r]));
    const representativesByEmail = new Map(allRepresentatives.map((r) => [r.email, r]));

    // ─── 8. Подписки ────────────────────────────────────────────────────────
    // Подписки создаются ДО задач — задачи можно ставить только подписанным депутатам
    console.log('🔔 Создаём подписки...');

    // 8a. Фиксированные подписки из seed-data.json
    const subscriptionMap = new Map<string, string[]>();

    for (const seedUser of seedData.users) {
        if (seedUser.role !== 'VOTER' || !seedUser.subscribeTo?.length) continue;
        const voter = allVoters.find((u) => u.email === seedUser.email);
        if (!voter) continue;

        const repIds: string[] = [];
        for (const repEmail of seedUser.subscribeTo) {
            const rep = representativesByEmail.get(repEmail);
            if (!rep) {
                console.warn(`   ⚠  Представитель "${repEmail}" не найден для подписки ${seedUser.email}`);
                continue;
            }
            try {
                await createSubscription(prisma, voter.id, rep.id);
                repIds.push(rep.id);
            } catch {
                // уже существует — просто добавляем в карту
                repIds.push(rep.id);
            }
        }
        if (repIds.length > 0) subscriptionMap.set(voter.id, repIds);
    }

    // 8b. Случайные подписки для сгенерированных VOTER
    const generatedSubscriptionMap = await createSubscriptionsForVoters(prisma, generatedVoters, allRepresentatives);
    for (const [voterId, repIds] of generatedSubscriptionMap.entries()) {
        const existing = subscriptionMap.get(voterId) ?? [];
        subscriptionMap.set(voterId, [...new Set([...existing, ...repIds])]);
    }

    const subscriptionCount = Array.from(subscriptionMap.values()).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`   ✓ Создано ${subscriptionCount} подписок\n`);

    // ─── 9. Задачи ──────────────────────────────────────────────────────────
    console.log(`📋 Создаём задачи...`);

    // 9a. Гарантированные задачи для preloaded voters из seed-data.json
    // Каждый voter получает минимум 1 задачу на каждого подписанного депутата
    const preloadedVoterIds = preloadedVoters.map((u) => u.id);
    const guaranteedTasks = await createGuaranteedTasksForVoters(
        prisma,
        preloadedVoterIds,
        representativesById,
        subscriptionMap,
    );
    console.log(`   ✓ Гарантированных задач (seed-data voters): ${guaranteedTasks.length}`);

    // 9b. Случайные задачи для всех подписанных пар
    const randomTasks = await createTasksForVoters(prisma, representativesById, subscriptionMap, CONFIG.tasksCount);
    console.log(`   ✓ Случайных задач: ${randomTasks.length}`);

    const tasks = [...guaranteedTasks, ...randomTasks];
    console.log(`   ✓ Итого задач: ${tasks.length}\n`);

    // ─── 10. TaskStage ──────────────────────────────────────────────────────
    console.log('📊 Создаём этапы задач...');
    let stagesTotal = 0;
    for (const task of tasks) {
        const stages = await createTaskStages(prisma, task);
        stagesTotal += stages.length;
    }
    console.log(`   ✓ Создано ${stagesTotal} этапов\n`);

    // ─── 11. Пересчёт tasksTotal/tasksCompleted ─────────────────────────────
    console.log('🔄 Пересчитываем статистику представителей...');
    for (const rep of allRepresentatives) {
        const total = await prisma.task.count({ where: { assigneeId: rep.id } });
        const completed = await prisma.task.count({ where: { assigneeId: rep.id, status: 'COMPLETED' } });
        await prisma.representativeProfile.updateMany({
            where: { userId: rep.id },
            data: { tasksTotal: total, tasksCompleted: completed },
        });
    }
    console.log('   ✓ Статистика обновлена\n');

    // ─── 12. Посты ──────────────────────────────────────────────────────────
    console.log(`📰 Создаём ${CONFIG.postsCount} постов...`);
    const posts = await createPostsForRepresentatives(prisma, allRepresentatives, CONFIG.postsCount);
    console.log(`   ✓ Создано ${posts.length} постов\n`);

    // ─── 13. Комментарии к задачам и постам ─────────────────────────────────
    console.log('💬 Создаём комментарии к задачам...');
    let taskCommentsTotal = 0;
    for (const task of tasks) {
        const comments = await createCommentsForTask(prisma, task, allUsers);
        taskCommentsTotal += comments.length;
    }
    console.log(`   ✓ Создано ${taskCommentsTotal} комментариев к задачам\n`);

    console.log('💬 Создаём комментарии к постам...');
    let postCommentsTotal = 0;
    for (const post of posts) {
        const comments = await createCommentsForPost(prisma, post, allUsers);
        postCommentsTotal += comments.length;
    }
    console.log(`   ✓ Создано ${postCommentsTotal} комментариев к постам\n`);

    // ─── 14. Диалоги ────────────────────────────────────────────────────────
    console.log('💬 Создаём диалоги...');
    const dialogs = await createDialogsFromSubscriptions(prisma, subscriptionMap);
    console.log(`   ✓ Создано ${dialogs.length} диалогов\n`);

    // ─── 15. Сообщения ──────────────────────────────────────────────────────
    console.log('✉  Создаём сообщения...');
    let messagesTotal = 0;
    for (const dialog of dialogs) {
        const messages = await createMessagesForDialog(prisma, dialog);
        messagesTotal += messages.length;
    }
    console.log(`   ✓ Создано ${messagesTotal} сообщений\n`);

    // ─── 16. Уведомления (демо под существующие сущности) ───────────────────
    console.log('📬 Создаём демо-уведомления...');
    const notificationRowsCount = await seedNotifications(prisma);
    console.log(`   ✓ Создано ${notificationRowsCount} уведомлений\n`);

    // ─── 17. Транзакции баланса (только VOTER) ──────────────────────────────
    console.log('💰 Создаём транзакции баланса для избирателей...');
    let txTotal = 0;
    for (const voter of allVoters) {
        const profile = await prisma.voterProfile.findUnique({ where: { userId: voter.id } });
        if (profile) {
            const { transactions } = await createBalanceTransactionsForVoter(prisma, voter.id);
            txTotal += transactions.length;
        }
    }
    console.log(`   ✓ Создано ${txTotal} транзакций баланса\n`);

    // ─── 18. Запись seed-output.json ────────────────────────────────────────
    const output = {
        seededAt: new Date().toISOString(),
        users: outputUsers,
    };
    fs.writeFileSync(SEED_OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
    console.log(`📄 Credentials сохранены в: ${SEED_OUTPUT_PATH}\n`);

    console.log('✅ Сидинг завершён успешно!\n');
    console.log('─── Итог ──────────────────────────────────');
    console.log(`  Округа:       ${districts.length}`);
    console.log(
        `  Пользователи: ${outputUsers.length} (voters: ${allVoters.length}, reps: ${allRepresentatives.length})`,
    );
    console.log(`  Посты:        ${posts.length}`);
    console.log(`  Диалоги:      ${dialogs.length}`);
    console.log(`  Уведомления:  ${notificationRowsCount}`);
    console.log('───────────────────────────────────────────\n');
}

/**
 * Возвращает пользователей, у которых ещё нет соответствующего профиля.
 */
async function filterUsersWithoutProfile(
    prisma: PrismaClient,
    users: User[],
    profileType: 'voter' | 'representative',
): Promise<User[]> {
    const result: User[] = [];
    for (const user of users) {
        if (profileType === 'voter') {
            const existing = await prisma.voterProfile.findUnique({ where: { userId: user.id } });
            if (!existing) result.push(user);
        } else {
            const existing = await prisma.representativeProfile.findUnique({ where: { userId: user.id } });
            if (!existing) result.push(user);
        }
    }
    return result;
}

main()
    .catch((e) => {
        console.error('❌ Ошибка сидинга:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
