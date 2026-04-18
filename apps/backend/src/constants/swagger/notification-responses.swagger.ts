import { ApiResponseOptions } from '@nestjs/swagger';

export const NOTIFICATION_READ: ApiResponseOptions = {
    status: 200,
    description: 'Уведомление успешно прочитано',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                message: 'Уведомление прочитано',
            },
        },
    },
};

export const NOTIFICATIONS_READ_ALL: ApiResponseOptions = {
    status: 200,
    description: 'Успешное прочтение всех уведомлений',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                message: 'Все уведомления прочитаны',
            },
        },
    },
};

export const GET_ALL_NOTIFICATIONS: ApiResponseOptions = {
    status: 200,
    description: 'Получить все уведомления',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Список всех уведомлений',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmo468ahn00068gjfiitqkmwk',
                                userId: 'cmo1upatm0004o4jf54u98ids',
                                type: 'NEW_TASK_ASSIGNED',
                                isRead: false,
                                title: 'Новое задание',
                                message: 'Вам назначена новая задача',
                                subscriptionId: null,
                                taskId: 'cmo468ahg00048gjfpywzskia',
                                postId: null,
                                commentId: null,
                                messageId: null,
                                createdAt: '2026-04-18T10:05:15.419Z',
                                subscription: null,
                                task: {
                                    title: 'Утечка воды в подъезде',
                                },
                                post: null,
                            },
                            {
                                id: 'cmo3cj6cy000r1sjfris5110k',
                                userId: 'cmo1upatm0004o4jf54u98ids',
                                type: 'NEW_SUBSCRIBER',
                                isRead: false,
                                title: 'Новый подписчик',
                                message: 'На вас подписался новый пользователь',
                                subscriptionId: 'cmo3cj6cl000p1sjfhrgew468',
                                taskId: null,
                                postId: null,
                                commentId: null,
                                messageId: null,
                                createdAt: '2026-04-17T20:13:54.802Z',
                                subscription: {
                                    id: 'cmo3cj6cl000p1sjfhrgew468',
                                    subscriberId: 'cmo1unnre0000o4jfjvdoebjs',
                                    representativeId: 'cmo1upatm0004o4jf54u98ids',
                                    createdAt: '2026-04-17T20:13:54.789Z',
                                    subscriber: {
                                        name: 'Андей Иванов',
                                    },
                                },
                                task: null,
                                post: null,
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Увeдомления не найдены',
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

export const NOTIFICATION_ACCESS_FORBIDDEN: ApiResponseOptions = {
    status: 403,
    description: 'Ошибка доступа: попытка прочитать уведомление другого пользователя',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: 'Нет доступа к уведомлению',
            },
        },
    },
};

export const NOTIFICATION_NOT_FOUND: ApiResponseOptions = {
    status: 404,
    description: 'Уведомление с указанным ID не существует в системе',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: 'Уведомление не найдено',
            },
        },
    },
};
