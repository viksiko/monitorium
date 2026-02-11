import { ApiResponseOptions } from '@nestjs/swagger';

export const SUBSCRIBE_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Успешная подписка на представителя',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                subscriberId: 'cmik6d2sm0000mojf4oz1jraa',
                representativeId: 'cmik6d2sm0000mojf4oz1jraa',
            },
        },
    },
};

export const SUBSCRIBE_CREATED_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешная подписка на представителя',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: { message: 'Подписка успешно оформлена' },
        },
    },
};

export const SUBSCRIBE_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка при попытке подписаться на представителя',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Ответ при невалидных данных',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: [
                                'ID представителя не может быть пустым',
                                'ID представителя должно быть строкой',
                            ],
                        },
                    },
                },
                b: {
                    summary:
                        'Ответ при попытке подписаться на не представителя власти',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message:
                                'Подписка возможна только на представителя власти',
                        },
                    },
                },
                c: {
                    summary: 'Ответ при попытке подписаться повторно',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: 'Вы уже подписаны на этого представителя',
                        },
                    },
                },
            },
        },
    },
};

// export const SUBSCRIBE_ERROR_RESPONSE: ApiResponseOptions = {
//     status: 400,
//     description: 'Ошибка при попытке подписаться на представителя',
//     schema: {
//         example: {
//             success: false,
//             statusCode: 400,
//             data: {
//                 message: [
//                     'ID представителя не может быть пустым',
//                     'ID представителя должно быть строкой',
//                 ],
//             },
//         },
//     },
// };

export const SUBSCRIBE_USER_NOT_FOUND_ERROR_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Представитель с указанным ID не найден',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: 'Пользователь не найден',
            },
        },
    },
};
