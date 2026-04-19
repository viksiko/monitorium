import { ApiResponseOptions } from '@nestjs/swagger';
import { POST_NOT_FOUND } from '../api-messages.constants';

const dataPostsFull = {
    success: true,
    statusCode: 200,
    data: {
        id: 'cmly9x5zr0001vcjfd0r2sl2z',
        title: 'Отчёт о проделанной работе за январь',
        content: 'За январь было выполнено 12 задач, проведено 3 встречи с жителями...',
        publishedAt: '2026-02-22T21:42:33.047Z',
        authorId: 'cmly1ul430001i4jfvmfbtkog',
        likesCount: 0,
        viewsCount: 0,
        createdAt: '2026-02-22T21:42:33.054Z',
        updatedAt: '2026-02-22T21:42:33.054Z',
        author: {
            name: 'Иван Иванов',
            representativeProfile: {
                position: 'Депутат городской думы',
            },
        },
        files: [],
    },
};

const dataPostsShort = [
    {
        id: 'cmly9x5zr0001vcjfd0r2sl2z',
        title: 'Отчёт о проделанной работе за январь',
        content: 'За январь было выполнено 12 задач, проведено 3 встречи с жителями...',
        publishedAt: '2026-02-22T21:42:33.047Z',
        authorId: 'cmly1ul430001i4jfvmfbtkog',
        likesCount: 0,
        viewsCount: 0,
        createdAt: '2026-02-22T21:42:33.054Z',
        updatedAt: '2026-02-22T21:42:33.054Z',
        files: [],
    },
    {
        id: 'cmlyy8gxn000084jf82gl1n6e',
        title: 'Встреча с жителями микрорайона',
        content: 'Вчера провел встречу с жителями микрорайона. Обсудили насущные...',
        publishedAt: '2026-02-22T21:42:33.047Z',
        authorId: 'cmlw5eb1z0000ywjfohd3nni2',
        likesCount: 0,
        viewsCount: 0,
        createdAt: '2026-02-22T21:42:33.054Z',
        updatedAt: '2026-02-22T21:42:33.054Z',
        files: [],
    },
];

export const GET_ALL_POSTS_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает все публикации из базы данных (требуются права администратора)',
    content: {
        'application/json': {
            examples: {
                PostsFound: {
                    summary: 'Ответ со списком всех публикаций',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: dataPostsShort,
                    },
                },
                PostsNotFound: {
                    summary: 'Публикации не найдены',
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

export const GET_ALL_POST_BY_USER: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает все публикации по id пользователя',
    content: {
        'application/json': {
            examples: {
                PostFound: {
                    summary: 'Ответ со списком всех публикаций одного пользователя',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: dataPostsShort,
                    },
                },
                PostNotFound: {
                    summary: 'Публикации не найдены',
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

export const GET_POST_BY_ID: ApiResponseOptions = {
    status: 200,
    description: 'Возвращает одну публикацию по id',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: dataPostsFull,
        },
    },
};

export const GET_LATEST_POSTS: ApiResponseOptions = {
    status: 200,
    description: 'Получить последние публикации',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Список послдених публикаций',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmo2p3lna0000tcjf0mm3p061',
                                title: 'Отчёт о проделанной работе за январь',
                                content: 'Vero quasi ea ex sin',
                                publishedAt: '2026-04-17T09:17:56.939Z',
                                authorId: 'cmo1upatm0004o4jf54u98ids',
                                likesCount: 0,
                                viewsCount: 0,
                                createdAt: '2026-04-17T09:17:56.950Z',
                                updatedAt: '2026-04-17T09:17:56.950Z',
                                author: {
                                    name: 'Ray Miller',
                                    district: {
                                        id: 'f86da90c-9073-4b7b-944d-4e79c44d9897',
                                        name: 'Округ №1',
                                    },
                                },
                                files: [],
                            },
                            {
                                id: 'cmo2owpxe0000qgjf4nvmm2u5',
                                title: 'Отчёт о проделанной работе за февраль',
                                content: 'Rerum perferendis iu',
                                publishedAt: '2026-04-17T09:12:35.893Z',
                                authorId: 'cmo1upatm0004o4jf54u98ids',
                                likesCount: 0,
                                viewsCount: 0,
                                createdAt: '2026-04-17T09:12:35.906Z',
                                updatedAt: '2026-04-17T09:12:35.906Z',
                                author: {
                                    name: 'Ray Miller',
                                    district: {
                                        id: 'f86da90c-9073-4b7b-944d-4e79c44d9897',
                                        name: 'Округ №1',
                                    },
                                },
                                files: [],
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Публикации не найдены',
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

export const CREATE_POST_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное создание публикации',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: dataPostsShort[0],
        },
    },
};

export const CREATE_POST_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при создании публикации',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Заголовок не может быть пустым',
                    'Заголовок должно быть не менее 2 символов',
                    'Заголовок должно быть строкой',
                    'Содержание не может быть пустым',
                    'Содержание должно быть не менее 2 символов',
                    'Содержание должно быть строкой',
                ],
            },
        },
    },
};

export const POST_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Публикация не найдена',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: POST_NOT_FOUND,
            },
        },
    },
};
