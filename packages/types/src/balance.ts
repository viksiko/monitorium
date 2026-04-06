export interface Balance {
    balance: number;
}

export interface Transaction {
    id: string;
    userId: string;
    type: BalanceTransactionType;
    amount: number;
    balanceAfter: number;
    direction: TransactionDirection;
    description: string | null;
    taskId: string | null;
    messageId: string | null;
    createdAt: string;
}

export interface UpdateBalance {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export enum BalanceTransactionType {
    REGISTRATION_BONUS = 'REGISTRATION_BONUS', // начисление при регистрации
    WATCH_AD = 'WATCH_AD', // пополнение при просомотре рекламы
    CREATE_TASK = 'CREATE_TASK', // списание при создании задания
    MESSAGE_REPRESENTATIVE = 'MESSAGE_REPRESENTATIVE', // списание при отправки сообщения
    PURCHASE_TICKETS = 'PURCHASE_TICKETS', // пополнение при покупке билетов (начисление)
    REPRESENTATIVE_SUBSCRIPTION = 'REPRESENTATIVE_SUBSCRIPTION', // пополнение за подписку на представителя власти
}

export enum TransactionDirection {
    CREDIT = 'CREDIT', // пополнение
    DEBIT = 'DEBIT', // списание
}
