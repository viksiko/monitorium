import { faker } from '@faker-js/faker/locale/ru';
import { PrismaClient, Task, TaskStage, TaskStatus } from '@prisma/client';

const STAGE_TITLES = [
    'Сбор документации и обращений',
    'Направление запроса в профильный комитет',
    'Рассмотрение на заседании думы',
    'Выезд на место с инспекцией',
    'Согласование с подрядчиком',
    'Начало ремонтных работ',
    'Промежуточная проверка хода работ',
    'Приёмка выполненных работ',
    'Отчёт о результатах',
];

/**
 * Создаёт этапы для задачи.
 *
 * Правила:
 * - Количество этапов: 0–4
 * - Если task.status === COMPLETED, все этапы isCompleted=true
 * - Если task.status === IN_PROGRESS, часть этапов завершена
 * - date — возрастающие даты от task.createdAt до desiredResolutionDate (или +6 месяцев)
 */
export async function createTaskStages(prisma: PrismaClient, task: Task) {
    const count = faker.number.int({ min: 0, max: 4 });
    if (count === 0) return [];

    const endDate = task.desiredResolutionDate ?? new Date(task.createdAt.getTime() + 1000 * 60 * 60 * 24 * 180);
    const stages: TaskStage[] = [];

    for (let i = 0; i < count; i++) {
        const stageDate = faker.date.between({ from: task.createdAt, to: endDate });

        let isCompleted: boolean;
        if (task.status === TaskStatus.COMPLETED) {
            isCompleted = true;
        } else if (task.status === TaskStatus.IN_PROGRESS) {
            isCompleted = i < Math.floor(count / 2);
        } else {
            isCompleted = false;
        }

        const stage = await prisma.taskStage.create({
            data: {
                taskId: task.id,
                title: faker.helpers.arrayElement(STAGE_TITLES),
                date: stageDate,
                isCompleted,
            },
        });
        stages.push(stage);
    }

    return stages;
}
