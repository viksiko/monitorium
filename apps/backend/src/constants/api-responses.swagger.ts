import { ApiResponseOptions } from '@nestjs/swagger';
import {
    DB_OPERATION_FAILED,
    DEACTIVATE_OWN_ACCOUNT_ONLY,
    EMAIL_NOT_VERIFIED,
    EMAIL_VERIFICATION_FAILED,
    INVALID_CREDENTIALS_MSG,
    LOGOUT_SUCCESS_MSG,
    MAIL_DELIVERY_MESSAGE,
    PASSWORD_RESET_SUCCESS,
    RATE_LIMIT_EXCEEDED_MESSAGE,
    REGISTRATION_CONFIRMED_MESSAGE,
    REGISTRATION_SUCCESS,
    TOKEN_INVALID,
    USER_ALREADY_EXISTS,
    USER_DEACTIVATED_SUCCESS,
    USER_NOT_AUTHORIZED,
} from './api-messages.constants';

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

export const HEALTH_CHECK_API: ApiResponseOptions = {
    status: 200,
    description: 'Успешное соединение',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                status: 'ok',
                service: 'Monitorium Backend',
            },
        },
    },
};

export const REGISTRATION_CONFIRMED_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Регистрация успешно подтверждена',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                message: REGISTRATION_CONFIRMED_MESSAGE,
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

export const USER_LOGIN_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Пользователь успешно авторизован',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiI...',
                userProfile: {
                    name: 'user1',
                    email: '1@test.test',
                    phone: '89775465522',
                    role: 'USER',
                },
            },
        },
    },
};

export const FORGOT_PASSWORD_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешно обработан запрос на смену пароля',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                message: MAIL_DELIVERY_MESSAGE,
            },
        },
    },
};

export const REFRESH_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешное обновление refrechToken',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                accessToken: 'eyJhbGciOiJIUzI1NiI...',
                userProfile: {
                    name: 'user1',
                    email: '1@test.test',
                    phone: '89775465522',
                    role: 'USER',
                },
            },
        },
    },
};

export const USER_REGISTER_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                message: REGISTRATION_SUCCESS,
            },
        },
    },
};

export const LOGOUT_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 201,
    description: 'Успешный выход пользователя из приложения',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                message: LOGOUT_SUCCESS_MSG,
            },
        },
    },
};

export const RESET_PASSWORD_CHANGED: ApiResponseOptions = {
    status: 201,
    description: 'Успешное изменение пароля',
    schema: {
        example: {
            success: true,
            statusCode: 201,
            data: {
                message: PASSWORD_RESET_SUCCESS,
            },
        },
    },
};

export const EMAIL_VERIFICATION_FAILED_RESPONSE: ApiResponseOptions = {
    status: 500,
    description:
        'Ошибка отправки письма поьзователю для подтверждения регистрации',
    schema: {
        example: {
            success: false,
            statusCode: 500,
            data: {
                message: EMAIL_VERIFICATION_FAILED,
            },
        },
    },
};

export const VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при регистрации',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Имя должно быть не более 50 символов',
                    'Имя должно быть не менее 2 символов',
                    'Имя должно быть строкой',
                    'Email не может быть пустым',
                    'Email должен быть не более 50 символов',
                    'Некорректный email',
                    'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                    'Пароль не может быть пустым',
                    'Пароль должен быть не более 50 символов',
                    'Пароль должен быть не менее 8 символов',
                    'Пароль должно быть строкой',
                    'Телефон не может быть пустым',
                    'Телефон должен состоять ровно из 11 символов',
                    'Телефон должно быть строкой',
                ],
            },
        },
    },
};

export const VALIDATION_FORGOT_PASSWORD_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при запросе на смену пароля',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Email не может быть пустым',
                    'Email должен быть не более 50 символов',
                    'Некорректный email',
                ],
            },
        },
    },
};

export const VALIDATION_RESET_PASSWORD_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при изменении пароля',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Токен не должен быть пустым',
                    'Токен должен быть строкой',
                    'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                    'Пароль не может быть пустым',
                    'Пароль должен быть не более 50 символов',
                    'Пароль должен быть не менее 8 символов',
                    'Пароль должно быть строкой',
                ],
            },
        },
    },
};

export const LOGIN_VALIDATION_ERROR_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Ошибка валидации данных при авторизации',
    schema: {
        example: {
            success: false,
            statusCode: 400,
            data: {
                message: [
                    'Email не может быть пустым',
                    'Email должен быть не более 50 символов',
                    'Некорректный email',
                    'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                    'Пароль не может быть пустым',
                    'Пароль должен быть не более 50 символов',
                    'Пароль должен быть не менее 8 символов',
                    'Пароль должно быть строкой',
                ],
            },
        },
    },
};

export const REFRESH_INVALID: ApiResponseOptions = {
    status: 401,
    description: 'RefreshToken недействителен, просрочен или пустой',
    schema: {
        example: {
            success: false,
            statusCode: 401,
            data: {
                message: TOKEN_INVALID,
            },
        },
    },
};

export const UNAUTHORIZED_ACCESS_RESPONSE: ApiResponseOptions = {
    status: 401,
    description: 'Неавторизованный доступ (отсутсвует в header Authorization)',
    schema: {
        example: {
            success: false,
            statusCode: 401,
            data: { message: USER_NOT_AUTHORIZED },
        },
    },
};

export const INVALID_ACCESS_TOKEN_RESPONSE: ApiResponseOptions = {
    status: 401,
    description: 'Неудачная попытка деактивации',
    schema: {
        example: {
            success: false,
            statusCode: 401,
            data: {
                message: TOKEN_INVALID,
            },
        },
    },
};

export const INVALID_RESET_PASSWORD_TOKEN_RESPONSE: ApiResponseOptions = {
    status: 401,
    description: 'Невалидный токен изменения пароля',
    schema: {
        example: {
            success: false,
            statusCode: 401,
            data: {
                message: TOKEN_INVALID,
            },
        },
    },
};

export const AUTHENTICATION_ERROR_RESPONSES: ApiResponseOptions = {
    status: 401,
    description: 'Ошибки доступа: невалидный токен или отсутствие авторизации',
    content: {
        'application/json': {
            examples: {
                UsersFound: {
                    summary: 'Невалидный токен доступа',
                    value: INVALID_ACCESS_TOKEN_RESPONSE.schema.example,
                },
                UserFoundByEmail: {
                    summary:
                        'Неавторизованный доступ (отсутсвует в header Authorization)',
                    value: UNAUTHORIZED_ACCESS_RESPONSE.schema.example,
                },
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

export const INVALID_TOKEN_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Неверный или просроченный токен',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: TOKEN_INVALID,
            },
        },
    },
};

export const EMAIL_NOT_VERIFIED_CONFLICT_RESPONSE: ApiResponseOptions = {
    status: 409,
    description: 'Регистрация не завершена: email не подтвержден',
    schema: {
        example: {
            success: false,
            statusCode: 409,
            data: {
                message: EMAIL_NOT_VERIFIED,
            },
        },
    },
};

export const UNAUTHORIZED_LOGIN_RESPONSE: ApiResponseOptions = {
    status: 409,
    description: 'Неверные данные авторизации',
    schema: {
        example: {
            success: false,
            statusCode: 409,
            data: {
                message: INVALID_CREDENTIALS_MSG,
            },
        },
    },
};

export const AUTH_CONFLICT_RESPONSE: ApiResponseOptions = {
    status: 409,
    description: 'Конфликты в процессе аутентификации пользователя',
    content: {
        'application/json': {
            examples: {
                EmailNotVerified: {
                    summary: 'Пользователь не подтвердил email',
                    value: EMAIL_NOT_VERIFIED_CONFLICT_RESPONSE.schema.example,
                },
                InvalidCredentials: {
                    summary: 'Неверные учетные данные',
                    value: UNAUTHORIZED_LOGIN_RESPONSE.schema.example,
                },
            },
        },
    },
};

export const USER_CONFLICT_RESPONSE: ApiResponseOptions = {
    status: 409,
    description:
        'Регистрация уже существующего пользователя (email или телефон заняты).',
    schema: {
        example: {
            success: false,
            statusCode: 409,
            data: {
                message: USER_ALREADY_EXISTS,
            },
        },
    },
};

export const TOO_MANY_REQUESTS_RESPONSE: ApiResponseOptions = {
    status: 429,
    description:
        'Слишком много запросов. Лимит запросов превышен. Повторите попытку позже.',
    schema: {
        example: {
            success: false,
            statusCode: 429,
            data: {
                message: RATE_LIMIT_EXCEEDED_MESSAGE,
            },
        },
    },
};

export const DATABASE_ERROR_RESPONSE: ApiResponseOptions = {
    status: 500,
    description: 'Ошибка доступа к базе данных. Сервер БД недоступен',
    schema: {
        example: {
            success: false,
            statusCode: 500,
            data: {
                message: DB_OPERATION_FAILED,
            },
        },
    },
};

export const SERVER_ERROR_RESPONSES_REGISTR: ApiResponseOptions = {
    status: 500,
    description: 'Ошибки на стороне сервера',
    content: {
        'application/json': {
            examples: {
                UsersFound: {
                    summary:
                        'Ошибка доступа к базе данных. Сервер БД недоступен',
                    value: DATABASE_ERROR_RESPONSE.schema.example,
                },
                UserFoundByEmail: {
                    summary: 'Ошибка отправки письма пользователю',
                    value: EMAIL_VERIFICATION_FAILED_RESPONSE.schema.example,
                },
            },
        },
    },
};
