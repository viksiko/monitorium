import { faker } from '@faker-js/faker/locale/ru';
import { Post, PrismaClient, User } from '@prisma/client';

const POST_TITLES = [
    // Отчёты и итоги
    'Итоги работы за квартал',
    'Итоги года: что удалось сделать',
    'Отчёт о реализации наказов избирателей',
    'Полугодовой отчёт перед жителями',
    'Отчёт о расходовании средств на благоустройство',

    // Благоустройство
    'Благоустройство дворовых территорий: что сделано',
    'Новые скверы и парки: план на лето',
    'Открытие обновлённого парка в центре района',
    'Завершение ремонта тротуаров на главной улице',
    'Высадка деревьев: итоги весеннего субботника',

    // ЖКХ и инфраструктура
    'Вопросы ЖКХ на заседании думы',
    'Замена теплотрасс: ход работ',
    'Ремонт дорог: план на следующий месяц',
    'Модернизация уличного освещения завершена',
    'Капитальный ремонт: какие дома включены в программу',
    'Новые контейнерные площадки для раздельного сбора мусора',

    // Образование и молодёжь
    'Новые проекты в области образования',
    'Строительство новой школы: получено финансирование',
    'Программа поддержки молодых семей в нашем районе',
    'Открытие детского технопарка',
    'Летние лагеря: как записать ребёнка',

    // Встречи и взаимодействие
    'Встреча с жителями района: итоги',
    'Приём граждан: расписание на следующий месяц',
    'Итоги публичных слушаний по проекту застройки',
    'Круглый стол по вопросам транспортной доступности',

    // Безопасность
    'Результаты инспекции детских площадок',
    'Установка видеонаблюдения в парках и дворах',
    'Ремонт аварийного моста завершён',
    'Меры по улучшению безопасности на дорогах района',

    // Открытия и события
    'Открытие нового сквера',
    'Торжественное открытие после реконструкции',
    'Поздравление с праздником жителей района',
    'День района: программа мероприятий',
    'Новый ФАП открыт в посёлке',

    // Инициативы и законодательство
    'Законодательная инициатива по защите зелёных зон',
    'Предложения по развитию общественного транспорта',
    'Обращение в правительство края: решение проблемы паводков',
    'Поправки к бюджету: дополнительные средства на медицину',
];

export interface PostInput {
    authorId: string;
    title?: string;
    content?: string;
    publishedAt?: Date;
    likesCount?: number;
    viewsCount?: number;
}

/**
 * Создаёт пост.
 *
 * Правила:
 * - authorId — только REPRESENTATIVE (как в post.controller.ts)
 * - publishedAt — в прошлом
 * - likesCount, viewsCount — случайные значения
 */
export async function createPost(prisma: PrismaClient, input: PostInput) {
    return prisma.post.create({
        data: {
            title: input.title ?? faker.helpers.arrayElement(POST_TITLES),
            content: input.content ?? faker.lorem.paragraphs({ min: 2, max: 5 }, '\n\n'),
            publishedAt: input.publishedAt ?? faker.date.past({ years: 1 }),
            authorId: input.authorId,
            likesCount: input.likesCount ?? faker.number.int({ min: 0, max: 1000 }),
            viewsCount: input.viewsCount ?? faker.number.int({ min: 0, max: 5000 }),
        },
    });
}

/**
 * Создаёт несколько постов для пула представителей.
 */
export async function createPostsForRepresentatives(prisma: PrismaClient, representatives: User[], totalCount: number) {
    const posts: Post[] = [];
    for (let i = 0; i < totalCount; i++) {
        const author = faker.helpers.arrayElement(representatives);
        const post = await createPost(prisma, { authorId: author.id });
        posts.push(post);
    }
    return posts;
}
