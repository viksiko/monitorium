import { faker } from '@faker-js/faker/locale/ru';
import { NotificationType, PrismaClient } from '@prisma/client';

/**
 * Заполняет таблицу уведомлений демо-данными по уже существующим сущностям.
 *
 * Зависит от: Subscription, Task, Post, Comment, Message (создаются ранее в seed.ts)
 *
 * Условия:
 * - Перед вставкой все строки notifications удаляются — повторный seed даёт тот же объём демо-уведомлений
 * - Типы и тексты согласованы с NotificationService / PostService / TaskService / SubscriptionService
 */
export async function seedNotifications(prisma: PrismaClient): Promise<number> {
    await prisma.notification.deleteMany({});

    type Row = {
        userId: string;
        type: NotificationType;
        isRead: boolean;
        title?: string | null;
        message?: string | null;
        subscriptionId?: string | null;
        taskId?: string | null;
        postId?: string | null;
        commentId?: string | null;
        messageId?: string | null;
    };

    const rows: Row[] = [];

    const subscriptions = await prisma.subscription.findMany();
    for (const sub of subscriptions) {
        rows.push({
            userId: sub.representativeId,
            type: NotificationType.NEW_SUBSCRIBER,
            isRead: faker.datatype.boolean({ probability: 0.35 }),
            title: 'Новый подписчик',
            message: 'На вас подписался новый пользователь',
            subscriptionId: sub.id,
        });
    }

    const tasks = await prisma.task.findMany({
        where: { assigneeId: { not: null } },
        select: { id: true, authorId: true, assigneeId: true, status: true },
    });

    for (const task of tasks) {
        rows.push({
            userId: task.assigneeId!,
            type: NotificationType.NEW_TASK_ASSIGNED,
            isRead: faker.datatype.boolean({ probability: 0.25 }),
            title: 'Новое задание',
            message: 'Вам назначена новая задача',
            taskId: task.id,
        });

        if (faker.datatype.boolean({ probability: 0.45 }) && task.status !== 'PLANNED') {
            rows.push({
                userId: task.authorId,
                type: NotificationType.TASK_STATUS_CHANGED,
                isRead: faker.datatype.boolean({ probability: 0.4 }),
                title: 'Изменения в задаче',
                message: 'Задача была обновлена',
                taskId: task.id,
            });
        }
    }

    const posts = await prisma.post.findMany({
        select: { id: true, authorId: true, title: true },
    });

    for (const post of posts) {
        for (const sub of subscriptions) {
            if (sub.representativeId !== post.authorId) continue;
            rows.push({
                userId: sub.subscriberId,
                type: NotificationType.NEW_POST,
                isRead: faker.datatype.boolean({ probability: 0.3 }),
                title: 'Новая публикация',
                message: post.title,
                postId: post.id,
            });
        }
    }

    const taskComments = await prisma.comment.findMany({
        where: { taskId: { not: null } },
        include: { task: { select: { authorId: true } } },
    });
    for (const c of taskComments) {
        if (!c.taskId || !c.task) continue;
        if (c.authorId === c.task.authorId) continue;
        if (!faker.datatype.boolean({ probability: 0.35 })) continue;
        rows.push({
            userId: c.task.authorId,
            type: NotificationType.NEW_COMMENT,
            isRead: faker.datatype.boolean({ probability: 0.5 }),
            title: 'Новый комментарий',
            message: 'К вашей задаче оставлен комментарий',
            taskId: c.taskId,
            commentId: c.id,
        });
    }

    const postComments = await prisma.comment.findMany({
        where: { postId: { not: null } },
        include: { post: { select: { authorId: true } } },
    });
    for (const c of postComments) {
        if (!c.postId || !c.post) continue;
        if (c.authorId === c.post.authorId) continue;
        if (!faker.datatype.boolean({ probability: 0.35 })) continue;
        rows.push({
            userId: c.post.authorId,
            type: NotificationType.NEW_COMMENT,
            isRead: faker.datatype.boolean({ probability: 0.5 }),
            title: 'Новый комментарий',
            message: 'К вашей публикации оставлен комментарий',
            postId: c.postId,
            commentId: c.id,
        });
    }

    const dialogs = await prisma.dialog.findMany({
        include: {
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
    });
    for (const d of dialogs) {
        const last = d.messages[0];
        if (!last) continue;
        const recipientId = last.senderId === d.voterId ? d.representativeId : d.voterId;
        rows.push({
            userId: recipientId,
            type: NotificationType.NEW_MESSAGE,
            isRead: faker.datatype.boolean({ probability: 0.2 }),
            title: 'Новое сообщение',
            message: 'Вам пришло личное сообщение',
            messageId: last.id,
        });
    }

    if (rows.length === 0) {
        return 0;
    }

    await prisma.notification.createMany({ data: rows });
    return rows.length;
}
