import { faker } from '@faker-js/faker/locale/ru';
import { Dialog, Message, PrismaClient } from '@prisma/client';

/**
 * Создаёт сообщения для диалога.
 *
 * Правила:
 * - 3–10 сообщений на диалог
 * - senderId чередуется: voter / representative / voter / ...
 * - createdAt — возрастающие даты (имитация реального чата)
 */
export async function createMessagesForDialog(prisma: PrismaClient, dialog: Dialog) {
    const count = faker.number.int({ min: 3, max: 10 });
    const messages: Message[] = [];

    const dialogCreatedAt = dialog.createdAt;
    const now = new Date();

    let currentDate = new Date(dialogCreatedAt.getTime());

    for (let i = 0; i < count; i++) {
        // Чередуем отправителя: чётные — voter, нечётные — representative
        const senderId = i % 2 === 0 ? dialog.voterId : dialog.representativeId;

        // Дата каждого следующего сообщения — позже предыдущего
        const nextDate = faker.date.between({
            from: currentDate,
            to: now,
        });
        currentDate = nextDate;

        const message = await prisma.message.create({
            data: {
                dialogId: dialog.id,
                senderId,
                text: faker.lorem.sentences({ min: 1, max: 3 }),
                createdAt: nextDate,
            },
        });
        messages.push(message);
    }

    // Обновляем updatedAt диалога до даты последнего сообщения
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        await prisma.dialog.update({
            where: { id: dialog.id },
            data: { updatedAt: lastMessage.createdAt },
        });
    }

    return messages;
}
