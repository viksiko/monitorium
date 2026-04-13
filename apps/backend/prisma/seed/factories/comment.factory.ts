import { faker } from '@faker-js/faker/locale/ru';
import { Comment, Post, PrismaClient, Task, User } from '@prisma/client';

export interface CommentInput {
    authorId: string;
    content?: string;
    postId?: string;
    taskId?: string;
}

/**
 * Создаёт комментарий.
 *
 * Правила:
 * - Полиморфная связь: postId XOR taskId — только одно из двух
 * - authorId — любой пользователь из пула
 * - Нарушение ограничения (оба null) вызовет ошибку Prisma — это ожидаемо
 */
export async function createComment(prisma: PrismaClient, input: CommentInput) {
    if (!input.postId && !input.taskId) {
        throw new Error('Comment must have either postId or taskId');
    }
    if (input.postId && input.taskId) {
        throw new Error('Comment cannot belong to both post and task simultaneously');
    }

    return prisma.comment.create({
        data: {
            content: input.content ?? faker.lorem.sentences({ min: 1, max: 3 }),
            authorId: input.authorId,
            postId: input.postId ?? null,
            taskId: input.taskId ?? null,
        },
    });
}

/**
 * Создаёт комментарии для задачи от случайных пользователей.
 * Количество: 0–5 комментариев на задачу.
 */
export async function createCommentsForTask(prisma: PrismaClient, task: Task, allUsers: User[]) {
    const count = faker.number.int({ min: 0, max: 5 });
    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
        const author = faker.helpers.arrayElement(allUsers);
        const comment = await createComment(prisma, {
            authorId: author.id,
            taskId: task.id,
        });
        comments.push(comment);
    }
    return comments;
}

/**
 * Создаёт комментарии для поста от случайных пользователей.
 * Количество: 0–8 комментариев на пост.
 */
export async function createCommentsForPost(prisma: PrismaClient, post: Post, allUsers: User[]) {
    const count = faker.number.int({ min: 0, max: 8 });
    const comments: Comment[] = [];
    for (let i = 0; i < count; i++) {
        const author = faker.helpers.arrayElement(allUsers);
        const comment = await createComment(prisma, {
            authorId: author.id,
            postId: post.id,
        });
        comments.push(comment);
    }
    return comments;
}
