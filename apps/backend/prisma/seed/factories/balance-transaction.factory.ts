import { faker } from '@faker-js/faker/locale/ru';
import { BalanceTransaction, BalanceTransactionType, PrismaClient, TransactionDirection } from '@prisma/client';

const REGISTRATION_BONUS_AMOUNT = 10;
const WATCH_AD_AMOUNT = 5;
const CREATE_TASK_AMOUNT = 5;
const MESSAGE_REPRESENTATIVE_AMOUNT = 2;

interface TransactionTemplate {
    type: BalanceTransactionType;
    direction: TransactionDirection;
    amount: number;
    description: string;
}

const CREDIT_TEMPLATES: TransactionTemplate[] = [
    {
        type: BalanceTransactionType.WATCH_AD,
        direction: TransactionDirection.CREDIT,
        amount: WATCH_AD_AMOUNT,
        description: 'Начисление за просмотр рекламы',
    },
    {
        type: BalanceTransactionType.REPRESENTATIVE_SUBSCRIPTION,
        direction: TransactionDirection.CREDIT,
        amount: 3,
        description: 'Начисление за подписку на представителя',
    },
];

const DEBIT_TEMPLATES: TransactionTemplate[] = [
    {
        type: BalanceTransactionType.CREATE_TASK,
        direction: TransactionDirection.DEBIT,
        amount: CREATE_TASK_AMOUNT,
        description: 'Списание за создание задания',
    },
    {
        type: BalanceTransactionType.MESSAGE_REPRESENTATIVE,
        direction: TransactionDirection.DEBIT,
        amount: MESSAGE_REPRESENTATIVE_AMOUNT,
        description: 'Списание за отправку сообщения представителю',
    },
];

/**
 * Создаёт историю транзакций баланса для VOTER.
 *
 * Правила:
 * - Первая транзакция — REGISTRATION_BONUS (CREDIT, amount=10)
 * - Последующие 2–6 транзакций — случайный набор списаний/пополнений
 * - balanceAfter рассчитывается накопительно
 * - Финальный balance синхронизируется с VoterProfile.balance
 * - Баланс не уходит ниже 0 (транзакция пропускается если баланс недостаточен)
 */
export async function createBalanceTransactionsForVoter(prisma: PrismaClient, userId: string) {
    let runningBalance = 0;
    const transactions: BalanceTransaction[] = [];

    // Первая транзакция — регистрационный бонус
    runningBalance += REGISTRATION_BONUS_AMOUNT;
    const registrationTx = await prisma.balanceTransaction.create({
        data: {
            userId,
            type: BalanceTransactionType.REGISTRATION_BONUS,
            direction: TransactionDirection.CREDIT,
            amount: REGISTRATION_BONUS_AMOUNT,
            balanceAfter: runningBalance,
            description: 'Регистрационный бонус',
        },
    });
    transactions.push(registrationTx);

    // 2–6 дополнительных транзакций
    const additionalCount = faker.number.int({ min: 2, max: 6 });
    for (let i = 0; i < additionalCount; i++) {
        const isCredit = faker.datatype.boolean({ probability: 0.5 });

        if (isCredit) {
            const template = faker.helpers.arrayElement(CREDIT_TEMPLATES);
            runningBalance += template.amount;
            const tx = await prisma.balanceTransaction.create({
                data: {
                    userId,
                    type: template.type,
                    direction: template.direction,
                    amount: template.amount,
                    balanceAfter: runningBalance,
                    description: template.description,
                },
            });
            transactions.push(tx);
        } else {
            const template = faker.helpers.arrayElement(DEBIT_TEMPLATES);
            if (runningBalance >= template.amount) {
                runningBalance -= template.amount;
                const tx = await prisma.balanceTransaction.create({
                    data: {
                        userId,
                        type: template.type,
                        direction: template.direction,
                        amount: template.amount,
                        balanceAfter: runningBalance,
                        description: template.description,
                    },
                });
                transactions.push(tx);
            }
        }
    }

    // Синхронизируем VoterProfile.balance с финальным балансом
    await prisma.voterProfile.update({
        where: { userId },
        data: { balance: runningBalance },
    });

    return { transactions, finalBalance: runningBalance };
}
