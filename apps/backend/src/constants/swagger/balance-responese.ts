import { ApiResponseOptions } from '@nestjs/swagger';

export const GET_BALANCE_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Получение баланса',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                balance: 99,
            },
        },
    },
};

export const GET_TRANSACTIONS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает транзакции по балансу',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Ответ со списком транзакций',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmnndaqx400003ojfu5lviest',
                                userId: 'cmnm9y829000a6sjfnvy50m8z',
                                type: 'CREATE_TASK',
                                amount: 10,
                                balanceAfter: 211,
                                direction: 'DEBIT',
                                description: null,
                                taskId: null,
                                messageId: null,
                                createdAt: '2026-04-06T15:51:02.344Z',
                            },
                            {
                                id: 'cmnnd70y6000130jfeaf04wh7',
                                userId: 'cmnm9y829000a6sjfnvy50m8z',
                                type: 'CREATE_TASK',
                                amount: 5,
                                balanceAfter: 226,
                                direction: 'CREDIT',
                                description: null,
                                taskId: null,
                                messageId: null,
                                createdAt: '2026-04-06T15:48:08.718Z',
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Ответ с пустым списком транзакций',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [],
                    },
                },
            },
        },
    },
};

export const UPDATE_BALANCE_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное выполнение операции с балансом',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                id: 'cmnm9y82c000b6sjfb9vnv6yu',
                userId: 'cmnm9y829000a6sjfnvy50m8z',
                balance: 216,
                createdAt: '2026-04-05T21:29:33.012Z',
                updatedAt: '2026-04-06T15:32:06.905Z',
            },
        },
    },
};

export const DEPOSIT_BALANCE_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при пополнении баланса',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Сумма не должна превышать 999999',
                    'Сумма должна быть положительным числом',
                    'Сумма должна быть целым числом',
                    'Указан недопустимый тип транзакции',
                ],
            },
        },
    },
};

export const WITHDRAW_BALANCE_INSUFFICIENT_FUNDS_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Недостаточно средств для выполнения операции',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: 'Недостаточно средств',
            },
        },
    },
};
