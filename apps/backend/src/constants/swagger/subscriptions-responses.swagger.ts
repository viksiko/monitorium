import { ApiResponseOptions } from '@nestjs/swagger';
import { SUBSCRIPTION_MESSAGES } from '../api-messages.constants';

export const SUBSCRIBE_CREATED_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешная подписка на представителя',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: { message: SUBSCRIPTION_MESSAGES.CREATE_SUCCESS },
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
                            message: ['ID представителя не может быть пустым', 'ID представителя должно быть строкой'],
                        },
                    },
                },
                b: {
                    summary: 'Ответ при попытке подписаться на не представителя власти',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: SUBSCRIPTION_MESSAGES.INVALID_TARGET,
                        },
                    },
                },
                c: {
                    summary: 'Ответ при попытке подписаться повторно',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED,
                        },
                    },
                },
                d: {
                    summary: 'Ответ при попытке подписаться на самого себя',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: SUBSCRIPTION_MESSAGES.SELF_SUBSCRIPTION,
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
