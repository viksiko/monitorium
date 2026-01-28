import { ApiResponseOptions } from '@nestjs/swagger';
import { TASK_MESSAGES } from '../api-messages.constants';

export const TASK_DELETE_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Успешное соединение',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                message: TASK_MESSAGES.DELETE_SUCCESS,
            },
        },
    },
};

export const GET_ALL_TASKS_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description:
        'Возвращает все задачи из базы данных (требуются права администратора)',
    content: {
        'application/json': {
            examples: {
                TasksFound: {
                    summary: 'Ответ со списком всех заданий',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmkv15eg10001lcjfnaqff138',
                                title: 'Утечка воды в подъезде',
                                address: 'ул. Ленина, д. 10, кв. 5',
                                problemDescription:
                                    'Протекает труба на втором этаже, вода капает на лестничную площадку',
                                possibleSolutions:
                                    'Необходимо заменить участок трубы или установить запорную арматуру',
                                desiredResolutionDate:
                                    '2024-12-31T00:00:00.000Z',
                                userId: 'cmkcmh53k0000f4jfuke45ev6',
                                status: 'NEW',
                                likes: 0,
                                createdAt: '2026-01-26T10:33:59.905Z',
                                updatedAt: '2026-01-26T10:33:59.905Z',
                                stages: [
                                    {
                                        id: 'cmkv4fznr0000m8jfrfe4gxdg',
                                        taskId: 'cmkv15eg10001lcjfnaqff138',
                                        title: 'Проверка труб',
                                        date: '2026-01-27T10:00:00.000Z',
                                        createdAt: '2026-01-26T12:06:12.806Z',
                                    },
                                ],
                                comments: [],
                                taskFiles: [],
                            },
                            {
                                id: 'cml0a8w1k0001lcjf1234abcd',
                                title: 'Ремонт лифта',
                                address: 'ул. Пушкина, д. 15, подъезд 2',
                                problemDescription:
                                    'Лифт не работает с понедельника, жители вынуждены ходить пешком',
                                possibleSolutions:
                                    'Требуется диагностика электроники и замена неисправных компонентов',
                                desiredResolutionDate:
                                    '2024-11-15T00:00:00.000Z',
                                userId: 'cmkcmh53k0000f4jfuke45ev7',
                                status: 'IN_PROGRESS',
                                ikes: 5,
                                createdAt: '2026-01-27T09:15:22.123Z',
                                updatedAt: '2026-01-28T14:20:33.456Z',
                                stages: [],
                                comments: [],
                                taskFiles: [],
                            },
                        ],
                    },
                },
                TasksNotFound: {
                    summary: 'Задания не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: null,
                    },
                },
            },
        },
    },
};

export const GET_ALL_TASKS_BY_USER: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает все задачи пользователя',
    content: {
        'application/json': {
            examples: {
                TasksFound: {
                    summary: 'Ответ со списком всех заданий пользователя',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'abc123def456',
                                title: 'Замена лифта',
                                address: 'ул. Центральная, д. 25, подъезд 3',
                                problemDescription:
                                    'Лифт не работает уже неделю, жители вынуждены подниматься пешком',
                                possibleSolutions:
                                    'Требуется полная диагностика оборудования и замена изношенных деталей',
                                desiredResolutionDate:
                                    '2024-11-15T00:00:00.000Z',
                                userId: 'xyz789uvw012',
                                status: 'IN_PROGRESS',
                                ikes: 5,
                                createdAt: '2026-01-25T09:15:30.000Z',
                                updatedAt: '2026-01-26T11:20:45.000Z',
                                stages: [],
                                comments: [],
                                taskFiles: [],
                            },
                            {
                                id: 'def456ghi789',
                                title: 'Ремонт крыши',
                                address: 'пр. Мира, д. 42',
                                problemDescription:
                                    'Протекает крыша после сильного дождя, повреждена гидроизоляция',
                                possibleSolutions:
                                    'Необходимо заменить участок кровли и восстановить гидроизоляционный слой',
                                desiredResolutionDate:
                                    '2024-10-20T00:00:00.000Z',
                                userId: 'mno345pqr678',
                                status: 'COMPLETED',
                                ikes: 12,
                                createdAt: '2026-01-20T14:10:25.000Z',
                                updatedAt: '2026-01-26T08:45:10.000Z',
                                stages: [
                                    {
                                        id: 'stage001',
                                        taskId: 'def456ghi789',
                                        title: 'Осмотр крыши',
                                        date: '2026-01-22T09:00:00.000Z',
                                        createdAt: '2026-01-21T10:30:15.000Z',
                                    },
                                    {
                                        id: 'stage002',
                                        taskId: 'def456ghi789',
                                        title: 'Закупка материалов',
                                        date: '2026-01-24T11:00:00.000Z',
                                        createdAt: '2026-01-23T13:20:40.000Z',
                                    },
                                ],
                                comments: [],
                                taskFiles: [],
                            },
                        ],
                    },
                },
                TasksNotFound: {
                    summary: 'Задания не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: null,
                    },
                },
            },
        },
    },
};

export const GET_TASK_BY_ID: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает одну задачу по id',
    content: {
        'application/json': {
            examples: {
                TasksFound: {
                    summary: 'Ответ со одинм заданием по id',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: {
                            id: 'abc123def456',
                            title: 'Замена лифта',
                            address: 'ул. Центральная, д. 25, подъезд 3',
                            problemDescription:
                                'Лифт не работает уже неделю, жители вынуждены подниматься пешком',
                            possibleSolutions:
                                'Требуется полная диагностика оборудования и замена изношенных деталей',
                            desiredResolutionDate: '2024-11-15T00:00:00.000Z',
                            userId: 'xyz789uvw012',
                            status: 'IN_PROGRESS',
                            ikes: 5,
                            createdAt: '2026-01-25T09:15:30.000Z',
                            updatedAt: '2026-01-26T11:20:45.000Z',
                            stages: [],
                            comments: [],
                            taskFiles: [],
                        },
                    },
                },
                TasksNotFound: {
                    summary: 'Задания не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: null,
                    },
                },
            },
        },
    },
};

export const GET_TASK_STAGES_BY_TASK: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает все этапы задания',
    content: {
        'application/json': {
            examples: {
                TasksFound: {
                    summary: 'Ответ с этапами к заданию',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmkwk9usm0000y0jfjfa7xgag',
                                taskId: 'cmkv9sd0g000114jfvw2rkul3',
                                title: 'Первичный осмотр труб',
                                date: '2026-01-27T10:00:00.000Z',
                                createdAt: '2026-01-27T12:17:06.598Z',
                            },
                            {
                                id: 'cmkwks4un0001scjf55vx1hj7',
                                taskId: 'cmkv9sd0g000114jfvw2rkul3',
                                title: 'Диагностика давления',
                                date: '2026-01-28T10:00:00.000Z',
                                createdAt: '2026-01-27T12:31:19.439Z',
                            },
                            {
                                id: 'cmkwkzjn500001gjfecsm61ng',
                                taskId: 'cmkv9sd0g000114jfvw2rkul3',
                                title: 'Замена поврежденных участков',
                                date: '2026-01-29T10:00:00.000Z',
                                createdAt: '2026-01-27T12:37:05.201Z',
                            },
                        ],
                    },
                },
                TasksNotFound: {
                    summary: 'Этапы к заданию не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: null,
                    },
                },
            },
        },
    },
};

export const CREATE_TASK_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание задания',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                success: true,
                statusCode: 201,
                data: {
                    id: 'cmkv9sd0g000114jfvw2rkul3',
                    title: 'Утечка воды в подъезде',
                    address: 'ул. Ленина, д. 10, кв. 5',
                    problemDescription:
                        'Протекает труба на втором этаже, вода капает на лестничную площадку',
                    possibleSolutions:
                        'Необходимо заменить участок трубы или установить запорную арматуру',
                    desiredResolutionDate: '2024-12-31T00:00:00.000Z',
                    userId: 'cmkcmh53k0000f4jfuke45ev6',
                    status: 'NEW',
                    likes: 0,
                    createdAt: '2026-01-26T14:35:48.064Z',
                    updatedAt: '2026-01-26T14:35:48.064Z',
                },
            },
        },
    },
};

export const CREATE_TASK_STAGES_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание этапа к заданию',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                id: 'cmkwks4un0001scjf55vx1hj7',
                taskId: 'cmkv9sd0g000114jfvw2rkul3',
                title: 'Проверка труб',
                date: '2026-01-28T10:00:00.000Z',
                createdAt: '2026-01-27T12:31:19.439Z',
            },
        },
    },
};

export const CREATE_TASK_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при создании задания',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Заголовок не может быть пустым',
                    'Заголовок должно быть не менее 2 символов',
                    'Заголовок должно быть строкой',
                    'Адрес не может быть пустым',
                    'Адрес должно быть не менее 2 символов',
                    'Адрес должно быть строкой',
                    'Описание не может быть пустым',
                    'Описание должно быть не менее 2 символов',
                    'Описание должно быть строкой',
                ],
            },
        },
    },
};

export const CREATE_TASK_STAGES_VALIDATION_ERROR_RESPONSE: ApiResponseOptions =
    {
        status: 400,
        description: 'Ошибка валидации данных при создании этапа к заданию',
        schema: {
            example: {
                success: false,
                statusCode: 400,
                data: {
                    message: [
                        [
                            'Заголовок не может быть пустым',
                            'Заголовок должно быть строкой',
                            'Дата должна быть в формате ISO 8601',
                            'Дата не может быть пустой',
                        ],
                    ],
                },
            },
        },
    };

export const TASK_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Задание не найдено',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: TASK_MESSAGES.NOT_FOUND,
            },
        },
    },
};
