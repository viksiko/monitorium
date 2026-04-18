import { ApiResponseOptions } from '@nestjs/swagger';
import { TASK_MESSAGES } from '../api-messages.constants';
import { BAD_REQUEST_PARAM } from './api-param.swagger';

const dataTasksFull = [
    {
        id: 'def456ghi789',
        title: 'Ремонт крыши',
        district: 'Округ №22',
        address: 'пр. Мира, д. 42',
        problemDescription: 'Протекает крыша после сильного дождя, повреждена гидроизоляция',
        possibleSolutions: 'Необходимо заменить участок кровли и восстановить гидроизоляционный слой',
        desiredResolutionDate: '2024-10-20T00:00:00.000Z',
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
    {
        id: 'abc123def456',
        title: 'Замена лифта',
        district: 'Округ №22',
        address: 'ул. Центральная, д. 25, подъезд 3',
        problemDescription: 'Лифт не работает уже неделю, жители вынуждены подниматься пешком',
        possibleSolutions: 'Требуется полная диагностика оборудования и замена изношенных деталей',
        desiredResolutionDate: '2024-11-15T00:00:00.000Z',
        userId: 'xyz789uvw012',
        status: 'IN_PROGRESS',
        likes: 5,
        createdAt: '2026-01-25T09:15:30.000Z',
        updatedAt: '2026-01-26T11:20:45.000Z',
        stages: [],
        comments: [],
        taskFiles: [],
    },
];

const dataTasksShort = [
    {
        id: 'cmlxwafsc000xb8jfcbe3pi5u',
        title: 'Утечка воды в подъезде',
        district: 'Округ №22',
        address: 'ул. Ленина, д. 10, кв. 5',
        desiredResolutionDate: '2024-12-31T00:00:00.000Z',
        likesCount: 0,
        viewsCount: 0,
        status: 'PLANNED',
        createdAt: '2026-02-22T15:20:57.706Z',
    },
    {
        id: 'cmlxw8mgr000ub8jfbmek7lx4',
        title: 'Ремонт крышы',
        district: 'Округ №22',
        address: 'ул. Советская, д. 10, кв. 5',
        desiredResolutionDate: '2024-12-31T00:00:00.000Z',
        likesCount: 0,
        viewsCount: 0,
        status: 'PLANNED',
        createdAt: '2026-02-22T15:20:57.706Z',
    },
];

const dataStagesTask = [
    {
        id: 'cmkwk9usm0000y0jfjfa7xgag',
        taskId: 'cmkv9sd0g000114jfvw2rkul3',
        title: 'Осмотр крыши',
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
];

export const TASK_DELETE_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Успешное удаление задания',
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
    description: 'Возвращает список задач',
    content: {
        'application/json': {
            examples: {
                TasksFound: {
                    summary: 'Ответ со списком всех заданий',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: dataTasksShort,
                    },
                },
                TasksNotFound: {
                    summary: 'Задания не найдены',
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

export const GET_TASK_BY_ID: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает одну задачу по id задачи',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: dataTasksFull[0],
        },
    },
};

export const GET_TASK_STAGES_BY_TASK: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает все этапы задания',
    content: {
        'application/json': {
            examples: {
                StagesFound: {
                    summary: 'Ответ с этапами к заданию',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: dataStagesTask,
                    },
                },
                StagesNotFound: {
                    summary: 'Этапы не найдены',
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

export const TASK_FILTER_LIST_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Cписок задач по фильтру',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Задачи по определенному округу',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: dataTasksFull,
                    },
                },
                b: {
                    summary: 'Задачи не найдены',
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

export const GET_LATEST_TASKS: ApiResponseOptions = {
    status: 200,
    description: 'Получить последние задания',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Список послдених заданий',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmo2yd6sw003lb0jfkm6i2trf',
                                title: 'Est ut similique te',
                                address: 'Voluptates incidunt',
                                district: {
                                    id: 'bf8e0826-017d-4f86-99f2-2798ad449985',
                                    name: 'Округ №28',
                                },
                                desiredResolutionDate: '2002-04-17T00:00:00.000Z',
                                likesCount: 0,
                                viewsCount: 0,
                                status: 'PLANNED',
                                createdAt: '2026-04-17T13:37:20.812Z',
                                author: {
                                    id: 'cmo1unnre0000o4jfjvdoebjs',
                                    name: 'Palmer Glover',
                                },
                                assignee: {
                                    id: 'cmo2u7c8k000cb0jfz617zt7p',
                                    name: 'Raphael Romero',
                                },
                            },
                            {
                                id: 'cmo2xsibk0038b0jfsp9h4bmp',
                                title: 'Iure labore aspernat',
                                address: 'Commodo perferendis ',
                                district: {
                                    id: 'bf8e0826-017d-4f86-99f2-2798ad449985',
                                    name: 'Округ №28',
                                },
                                desiredResolutionDate: '1998-07-23T00:00:00.000Z',
                                likesCount: 0,
                                viewsCount: 0,
                                status: 'PLANNED',
                                createdAt: '2026-04-17T13:21:15.965Z',
                                author: {
                                    id: 'cmo2ujroo000jb0jflhobub4d',
                                    name: 'Ora Pope',
                                },
                                assignee: {
                                    id: 'cmo2u7c8k000cb0jfz617zt7p',
                                    name: 'Raphael Romero',
                                },
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Задания не найдены',
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

export const CREATE_TASK_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание задания',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: dataTasksFull[0],
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
            data: dataStagesTask[0],
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

export const CREATE_TASK_STAGES_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
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

export const TASK_BAD_REQUEST_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Неверный параметр запроса',
    schema: {
        example: BAD_REQUEST_PARAM,
    },
};

export const NO_TASK_ACCESS_RESPONSE: ApiResponseOptions = {
    status: 403,
    description: 'Нет доступа к заданию',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: TASK_MESSAGES.NO_ACCESS,
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
