import { ApiResponseOptions } from '@nestjs/swagger';

/** Пример созданного комментария к посту (`POST /v1/comments`, `authorId` из JWT). */
const dataCommentOnPost = {
    id: 'cm_comment_post_example01',
    content: 'Этот пост очень интересный',
    authorId: 'cmlw5er040002ywjfhic1r0wa',
    postId: 'cmm8ak4c5000ddsjf7hhizpj2',
    taskId: null,
    createdAt: '2026-04-04T12:00:00.000Z',
    updatedAt: '2026-04-04T12:00:00.000Z',
};

export const CREATE_COMMENT_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Комментарий создан. Поле `data` — сохранённая сущность; `authorId` проставляется сервером из токена.',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: dataCommentOnPost,
        },
    },
};

export const CREATE_COMMENT_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description:
        'Ошибка при создании комментария: невалидное тело запроса (class-validator) или одновременно указаны `postId` и `taskId` (проверка в сервисе). Формат ответа задаётся глобальным `HttpExceptionFilter`.',
    content: {
        'application/json': {
            examples: {
                classValidator: {
                    summary: 'Ошибки валидации полей DTO',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: [
                                'Комментарий не может быть пустым',
                                'Комментарий должен содержать текст',
                                'ID поста должен быть строкой',
                                'ID задачи должен быть строкой',
                            ],
                        },
                    },
                },
                bothTargets: {
                    summary: 'Указаны и postId, и taskId',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: 'Одновременно не может быть указан ID поста и ID задачи.',
                        },
                    },
                },
            },
        },
    },
};
