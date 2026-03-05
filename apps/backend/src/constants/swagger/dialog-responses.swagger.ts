import { ApiResponseOptions } from '@nestjs/swagger';

export const DIALOGS_AND_SUBSCRIPTIONS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает спиок диалогов и подписки без диалога',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Существуюий диалог с послeдним сообщением',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmmamoo9p0002agjfg1le6ucq',
                                voterId: 'cmm90almc001cccjf5jsp1xnw',
                                representativeId: 'cmm8aiky20006dsjfdpzad8ny',
                                createdAt: '2026-03-03T13:13:06.013Z',
                                updatedAt: '2026-03-03T13:13:06.013Z',
                                voterLastReadAt: null,
                                representativeLastReadAt: null,
                                representative: {
                                    id: 'cmm8aiky20006dsjfdpzad8ny',
                                    name: 'Anthony Travis',
                                    representativeProfile: {
                                        position: 'Qui molestiae aperia',
                                    },
                                },
                                voter: {
                                    id: 'cmm90almc001cccjf5jsp1xnw',
                                    name: 'Finn Delacruz',
                                },
                                messages: [
                                    {
                                        id: 'cmmamoo9s0003agjfvhqcumor',
                                        text: 'df',
                                        createdAt: '2026-03-03T13:13:06.016Z',
                                        senderId: 'cmm90almc001cccjf5jsp1xnw',
                                    },
                                ],
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Подписки у которых пока нет диалогов',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: null,
                                voter: {
                                    id: 'cmm90almc001cccjf5jsp1xnw',
                                },
                                representative: {
                                    id: 'cmm8aiky20006dsjfdpzad8ny',
                                    name: 'Anthony Travis',
                                    representativeProfile: {
                                        position: 'Qui molestiae aperia',
                                    },
                                },
                                messages: [],
                            },
                        ],
                    },
                },
                c: {
                    summary: 'Диалоги и подписки не найдены',
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

export const CREATE_DIALOG_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание диалога',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: [
                {
                    id: 'cmmam60pd0001n4jfcqfezg4k',
                    dialogId: 'cmmam60p50000n4jffgmrksc1',
                    senderId: 'cmm90almc001cccjf5jsp1xnw',
                    text: 'Здравствуйте! У меня вопрос по вашей программе',
                    createdAt: '2026-03-03T12:58:35.665Z',
                },
                {
                    id: 'cmmam60pd0001n4jfcqfezg4k',
                    dialogId: 'cmmam60p50000n4jffgmrksc1',
                    senderId: 'cmm90almc001cccjf5jsp1xnw',
                    text: 'Здравствуйте! У меня вопрос по вашей программе',
                    createdAt: '2026-03-03T12:58:35.665Z',
                },
            ],
        },
    },
};

export const GET_DIALOG_MESSAGES_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное получение всех сообщений из диалога',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                id: 'cmmam60p50000n4jffgmrksc1',
                voterId: 'cmm90almc001cccjf5jsp1xnw',
                representativeId: 'cmm8aiky20006dsjfdpzad8ny',
                createdAt: '2026-03-03T12:58:35.657Z',
                updatedAt: '2026-03-03T12:58:35.657Z',
                voterLastReadAt: null,
                representativeLastReadAt: null,
                representative: {
                    id: 'cmm8aiky20006dsjfdpzad8ny',
                    name: 'Anthony Travis',
                    representativeProfile: {
                        position: 'Qui molestiae aperia',
                    },
                },
                voter: {
                    id: 'cmm90almc001cccjf5jsp1xnw',
                    name: 'Finn Delacruz',
                },
            },
            message: {
                id: 'cmmaoevrn0003rkjfqdsyt6j8',
                dialogId: 'cmmam60p50000n4jffgmrksc1',
                senderId: 'cmm90almc001cccjf5jsp1xnw',
                text: 'Добрый день!',
                createdAt: '2026-03-03T12:58:35.665Z',
            },
        },
    },
};

export const CREATE_MESSAGE_DIALOG_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание сообщения',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                success: true,
                statusCode: 201,
                data: {
                    id: 'cmmao05of0002jojf7c1v54l3',
                    dialogId: 'cmmanzofi0000jojfg3nvzm8i',
                    senderId: 'cmm90almc001cccjf5jsp1xnw',
                    text: 'Здравствуйте! У меня вопрос по вашей программе',
                    createdAt: '2026-03-03T13:50:01.407Z',
                },
            },
        },
    },
};

export const CREATE_DIALOG_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при создании диалога',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'ID представителя не может быть пустым',
                    'ID представителя должен быть строкой',
                    'Текст сообщения не может превышать 5000 символов',
                    'Текст сообщения не может быть пустым',
                    'Текст сообщения должен быть строкой',
                ],
            },
        },
    },
};

export const CREATE_MESSAGE_DIALOG_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при создании сообщения в диалоге',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Текст сообщения не может превышать 5000 символов',
                    'Текст сообщения не может быть пустым',
                    'Текст сообщения должен быть строкой',
                ],
            },
        },
    },
};

export const NO_SUBSCRIPTION_RESPONSE: ApiResponseOptions = {
    status: 403,
    description: 'Нет подписки на представителя власти',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: 'Нет подписки на представителя власти',
            },
        },
    },
};

export const NO_DIALOG_ACCESS_RESPONSE: ApiResponseOptions = {
    status: 403,
    description: 'Нет доступа к диалогу',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: 'Нет доступа к диалогу',
            },
        },
    },
};

export const DIALOG_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Диалог не найден',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: 'Диалог не найден',
            },
        },
    },
};
