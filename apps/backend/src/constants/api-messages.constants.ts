export const DB_OPERATION_FAILED =
    'Не удалось выполнить операцию с базой данных. Повторите попытку позже.';

// user, auth
export const USER_NOT_AUTHORIZED = 'Пользователь не авторизован.';

export const USER_ALREADY_EXISTS = 'Пользователь уже существует.';

export const INVALID_CREDENTIALS_MSG = 'Неверный email или пароль.';

export const REFRESH_TOKEN_MISSING = 'Отсутсвует refreshToken.';

export const LOGOUT_SUCCESS_MSG = 'Успешный выход из системы.';

export const EMAIL_VERIFICATION_FAILED =
    'Не удалось отправить ссылку для подтверждения почты. Попробуйте еще раз позже.';

export const REGISTRATION_SUCCESS =
    'Пожалуйста, проверьте вашу электронную почту для получения ссылки подтверждения.';

export const EMAIL_NOT_VERIFIED =
    'Учетная запись неактивна, требуется подтверждение по eamil.';

export const USER_DEACTIVATED_SUCCESS = 'Пользователь успешно деактивирован.';

export const REGISTRATION_CONFIRMED_MESSAGE =
    'Регистрация успешно подтверждена. Теперь вы можете войти в систему.';

export const DEACTIVATE_OWN_ACCOUNT_ONLY =
    'Вы можете деактивировать только свой собственный аккаунт.';

export const MAIL_DELIVERY_MESSAGE =
    'Если адрес указан верно, письмо с инструкцией по сбросу паролям придет в течение нескольких минут.';

export const TOKEN_INVALID = 'Неверный токен или cрок действия его истек.';

export const PASSWORD_RESET_SUCCESS = 'Пароль успешно изменен.';

export const RATE_LIMIT_EXCEEDED_MESSAGE =
    'Вы исчерпали лимит запросов. Попробуйте позже.';

export const FORBIDDEN_RESOURCE = 'Forbidden resource';

export const AUTHORIZATION_REQUIRED = 'Требуется авторизация';

// task
export const TASK_MESSAGES = {
    // Успешные операции
    DELETE_SUCCESS: 'Задание успешно удалено',
    CREATE_SUCCESS: 'Задание успешно создано',
    UPDATE_SUCCESS: 'Задание успешно обновлено',
    GET_SUCCESS: 'Задание успешно получено',

    // Ошибки
    NOT_FOUND: 'Задание не найдено',
    NOT_FOUND_BY_ID: (id: string) => `Задание с ID ${id} не найдено`,
    ALREADY_EXISTS: 'Задание уже существует',
    NO_ACCESS: 'Нет доступа к заданию',
    VALIDATION_ERROR: 'Ошибка валидации данных задания',

    // Дополнительные
    EMPTY_LIST: 'Список заданий пуст',
    INVALID_STATUS: 'Неверный статус задания',
} as const;
