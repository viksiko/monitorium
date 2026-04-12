import { faker } from '@faker-js/faker/locale/ru';
import { PrismaClient, Task, TaskStatus, User } from '@prisma/client';

const TASK_STATUS_VALUES: TaskStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

const TASK_TITLES = [
    'Ремонт ямы на пересечении улиц',
    'Установка детской площадки во дворе',
    'Уборка несанкционированной свалки',
    'Ремонт освещения на пешеходной дорожке',
    'Установка лавочек и урн в сквере',
    'Ремонт тротуара у школы №14',
    'Покраска фасада дома по программе благоустройства',
    'Организация парковки у поликлиники',
    'Установка светофора на опасном перекрёстке',
    'Ремонт крыши в МКД',
    'Расчистка ливневой канализации',
    'Замена изношенных труб теплоснабжения',
    'Обустройство пешеходного перехода',
    'Вырубка аварийных деревьев во дворе',
    'Установка шлагбаума на въезде во двор',
    'Восстановление газонного покрытия после ремонта',
    'Ремонт подъездных дверей',
    'Установка видеонаблюдения у школы',
    'Ликвидация потопа в подвале МКД',
    'Ремонт дороги в частном секторе',
];

const PROBLEM_DESCRIPTIONS = [
    'Разбитые дороги и ямы на проезжей части создают опасность для автомобилистов и пешеходов.',
    'Отсутствие освещения на улице приводит к повышенной аварийности в ночное время.',
    'Неудовлетворительное состояние детской площадки: сломано оборудование, отсутствуют безопасные покрытия.',
    'Несанкционированная свалка мусора вблизи жилых домов создаёт антисанитарные условия.',
    'Отсутствие пешеходного перехода в месте массового пешеходного трафика.',
    'Аварийное состояние теплотрассы приводит к постоянным прорывам и перебоям отопления.',
    'Переполненность контейнеров для мусора и нерегулярный вывоз отходов.',
    'Разрушение тротуаров в районе школы создаёт опасность для детей.',
    'Подъездные двери не закрываются, в подъезд проникают посторонние лица.',
    'На газоне после ремонта дороги образовались глубокие колеи, опасные для пешеходов.',
    'Ливневая канализация не справляется: при дожде двор затапливает.',
    'В подвале МКД стоит вода уже несколько недель, управляющая компания не реагирует.',
];

export interface TaskInput {
    authorId: string;
    districtId: string;
    assigneeId: string;
    title?: string;
    address?: string;
    problemDescription?: string;
    possibleSolutions?: string | null;
    desiredResolutionDate?: Date | null;
    status?: TaskStatus;
    likesCount?: number;
    viewsCount?: number;
}

/**
 * Создаёт задачу.
 *
 * Правила:
 * - authorId — только VOTER (представители власти не создают задачи)
 * - assigneeId — обязателен, только REPRESENTATIVE
 * - districtId берётся из assignee.districtId (представитель отвечает за свой округ)
 * - Баланс при сидинге НЕ списывается (обходим transactional guard)
 * - status — случайный из TaskStatus
 */
export async function createTask(prisma: PrismaClient, input: TaskInput) {
    const status = input.status ?? faker.helpers.arrayElement(TASK_STATUS_VALUES);

    return prisma.task.create({
        data: {
            title: input.title ?? faker.helpers.arrayElement(TASK_TITLES),
            address: input.address ?? `г. Барнаул, ${faker.location.streetAddress()}`,
            problemDescription: input.problemDescription ?? faker.helpers.arrayElement(PROBLEM_DESCRIPTIONS),
            possibleSolutions:
                input.possibleSolutions !== undefined
                    ? input.possibleSolutions
                    : faker.datatype.boolean({ probability: 0.6 })
                      ? faker.lorem.sentences(2)
                      : null,
            desiredResolutionDate:
                input.desiredResolutionDate !== undefined
                    ? input.desiredResolutionDate
                    : faker.datatype.boolean({ probability: 0.7 })
                      ? faker.date.future({ years: 1 })
                      : null,
            status,
            districtId: input.districtId,
            authorId: input.authorId,
            assigneeId: input.assigneeId,
            likesCount: input.likesCount ?? faker.number.int({ min: 0, max: 500 }),
            viewsCount: input.viewsCount ?? faker.number.int({ min: 0, max: 2000 }),
        },
    });
}

/**
 * Гарантирует минимум 1 задачу для каждого voter'а из указанного списка.
 * Для каждого voter'а создаёт по 1 задаче на каждого его подписанного депутата.
 *
 * Используется для preloaded voters из seed-data.json.
 */
export async function createGuaranteedTasksForVoters(
    prisma: PrismaClient,
    voterIds: string[],
    representativesById: Map<string, User>,
    subscriptionMap: Map<string, string[]>,
) {
    const tasks: Task[] = [];

    for (const voterId of voterIds) {
        const repIds = subscriptionMap.get(voterId) ?? [];
        if (repIds.length === 0) continue;

        // Одна задача на каждого подписанного депутата
        for (const repId of repIds) {
            const assignee = representativesById.get(repId);
            if (!assignee?.districtId) continue;

            const task = await createTask(prisma, {
                authorId: voterId,
                assigneeId: repId,
                districtId: assignee.districtId,
            });
            tasks.push(task);
        }
    }

    return tasks;
}

/**
 * Создаёт случайные задачи от VOTER'ов с назначением на REPRESENTATIVE.
 *
 * Правила:
 * - Автор задачи — VOTER, который подписан на исполнителя (subscriptionMap)
 * - Исполнитель — REPRESENTATIVE из подписок этого voter'а (с districtId)
 * - districtId задачи берётся из assignee (он отвечает за свой округ)
 *
 * subscriptionMap: Map<voterId, representativeId[]> — строится из таблицы subscriptions
 */
export async function createTasksForVoters(
    prisma: PrismaClient,
    representativesById: Map<string, User>,
    subscriptionMap: Map<string, string[]>,
    totalCount: number,
) {
    // Собираем все валидные пары (voterId, repId) где у rep есть districtId
    const validPairs: Array<{ voterId: string; repId: string }> = [];
    for (const [voterId, repIds] of subscriptionMap.entries()) {
        for (const repId of repIds) {
            const rep = representativesById.get(repId);
            if (rep?.districtId) {
                validPairs.push({ voterId, repId });
            }
        }
    }

    if (validPairs.length === 0) {
        throw new Error('Нет валидных пар voter→representative для создания задач');
    }

    const tasks: Task[] = [];
    for (let i = 0; i < totalCount; i++) {
        const pair = faker.helpers.arrayElement(validPairs);
        const assignee = representativesById.get(pair.repId)!;
        const task = await createTask(prisma, {
            authorId: pair.voterId,
            assigneeId: pair.repId,
            districtId: assignee.districtId!,
        });
        tasks.push(task);
    }
    return tasks;
}
