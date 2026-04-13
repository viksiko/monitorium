import { Dialog, PrismaClient } from '@prisma/client';

/**
 * Создаёт диалог между voter и representative.
 *
 * Правила:
 * - [voterId, representativeId] уникальная пара (ограничение на уровне БД)
 * - Диалоги создаются только для пар, у которых есть активная Subscription
 */
export async function createDialog(prisma: PrismaClient, voterId: string, representativeId: string) {
    return prisma.dialog.create({
        data: {
            voterId,
            representativeId,
        },
    });
}

/**
 * Создаёт диалоги на основе карты подписок.
 * subscriptionMap: Map<voterId, representativeId[]>
 *
 * Возвращает созданные диалоги.
 */
export async function createDialogsFromSubscriptions(prisma: PrismaClient, subscriptionMap: Map<string, string[]>) {
    const dialogs: Dialog[] = [];

    for (const [voterId, repIds] of subscriptionMap.entries()) {
        for (const representativeId of repIds) {
            try {
                const dialog = await createDialog(prisma, voterId, representativeId);
                dialogs.push(dialog);
            } catch {
                // Игнорируем дублирующиеся диалоги (unique constraint)
            }
        }
    }

    return dialogs;
}
