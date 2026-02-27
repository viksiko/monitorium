import { ApiResponseOptions } from '@nestjs/swagger';
import {
    AUTHORIZATION_REQUIRED,
    DB_OPERATION_FAILED,
    EMAIL_VERIFICATION_FAILED,
    FORBIDDEN_RESOURCE,
} from '../api-messages.constants';

export const TOKEN_INVALID_RES = {
    success: false,
    statusCode: 401,
    data: {
        message: AUTHORIZATION_REQUIRED,
    },
};

export const USER_NOT_AUTHORIZED_RES = {
    success: false,
    statusCode: 401,
    data: { message: AUTHORIZATION_REQUIRED },
};

export const UNAUTHORIZED_ACCESS_RESPONSE: ApiResponseOptions = {
    status: 401,
    description: 'Неавторизованный доступ (отсутсвует в header Authorization)',
    schema: {
        example: USER_NOT_AUTHORIZED_RES,
    },
};

export const INVALID_ACCESS_TOKEN_RESPONSE: ApiResponseOptions = {
    status: 401,
    description: 'Неудачная попытка деактивации',
    schema: {
        example: TOKEN_INVALID_RES,
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
                    summary: 'Неавторизованный доступ (отсутсвует в header Authorization)',
                    value: UNAUTHORIZED_ACCESS_RESPONSE.schema.example,
                },
            },
        },
    },
};

export const FORBIDDEN_RESOURCE_RESPONSE: ApiResponseOptions = {
    status: 403,
    description: 'Нет прав для выполнения операции',
    schema: {
        example: {
            success: false,
            statusCode: 403,
            data: {
                message: FORBIDDEN_RESOURCE,
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

export const EMAIL_VERIFICATION_FAILED_RESPONSE: ApiResponseOptions = {
    status: 500,
    description: 'Ошибка отправки письма поьзователю для подтверждения регистрации',
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

export const SERVER_ERROR_RESPONSES_REGISTR: ApiResponseOptions = {
    status: 500,
    description: 'Ошибки на стороне сервера',
    content: {
        'application/json': {
            examples: {
                UsersFound: {
                    summary: 'Ошибка доступа к базе данных. Сервер БД недоступен',
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
