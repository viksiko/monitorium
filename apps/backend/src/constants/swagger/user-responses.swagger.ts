import { ApiResponseOptions } from '@nestjs/swagger';
import {
    DEACTIVATE_OWN_ACCOUNT_ONLY,
    USER_DEACTIVATED_SUCCESS,
} from '../api-messages.constants';

export const USER_LIST_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description:
        'Если параметр "email" не указан, возвращается список всех пользователей. Если пользователи не найдены возвращается null.',
    content: {
        'application/json': {
            examples: {
                UsersFound: {
                    summary: 'Ответ со списком всех пользователей',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmik6d2sm0000mojf4oz1jraa',
                                name: 'user1',
                                email: '1@test.test',
                                role: 'USER',
                            },
                            {
                                id: 'cmik6d2sm0000mojf4oz1jrbb',
                                name: 'user2',
                                email: '2@test.test',
                                role: 'USER',
                            },
                        ],
                    },
                },
                UserFoundByEmail: {
                    summary: 'Ответ с одним найденным пользователем по email',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: {
                            id: 'cmik6d2sm0000mojf4oz1jraa',
                            name: 'user1',
                            email: '1@test.test',
                            role: 'USER',
                        },
                    },
                },
                UserNotFound: {
                    summary: 'Пользователи не найдены',
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

export const USER_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Если указан несуществующий id вернется null',
    content: {
        'application/json': {
            examples: {
                UserFoundById: {
                    summary: 'Ответ с одним найденным пользователем по id',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: {
                            id: 'cmik6d2sm0000mojf4oz1jraa',
                            name: 'user1',
                            email: '1@test.test',
                            role: 'USER',
                        },
                    },
                },
                UserNotFound: {
                    summary: 'Пользователь не найден',
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

export const USER_ACCOUNT_DEACTIVATED_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Удачная попытка деактивации',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                message: USER_DEACTIVATED_SUCCESS,
            },
        },
    },
};

export const DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE: ApiResponseOptions = {
    status: 403,
    description: 'Попытка дективации чужой учетной записи',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: DEACTIVATE_OWN_ACCOUNT_ONLY,
            },
        },
    },
};
