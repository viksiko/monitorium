export const DB_OPERATION_FAILED = 'Не удалось выполнить операцию с базой данных. Повторите попытку позже.';
export const USER_NOT_AUTHORIZED = 'Пользователь не авторизован.';
export const USER_ALREADY_EXISTS = 'Пользователь уже существует.';
export const INVALID_CREDENTIALS_MSG = 'Неверный email или пароль.';
export const REFRESH_TOKEN_MISSING = 'Отсутсвует refreshToken.';
export const LOGOUT_SUCCESS_MSG = 'Успешный выход из системы.';
export const EMAIL_VERIFICATION_FAILED =
    'Не удалось отправить ссылку для подтверждения почты. Попробуйте еще раз позже.';
export const REGISTRATION_SUCCESS = 'Пожалуйста, проверьте вашу электронную почту для получения ссылки подтверждения.';
export const EMAIL_NOT_VERIFIED = 'Учетная запись неактивна, требуется подтверждение по eamil.';
export const ACCOUNT_INACTIVE = 'Учетная запись деактивирована. Обратитесь к администратору.';
export const USER_DEACTIVATED_SUCCESS = 'Пользователь успешно деактивирован.';
export const REGISTRATION_CONFIRMED_MESSAGE = 'Регистрация успешно подтверждена. Теперь вы можете войти в систему.';
export const DEACTIVATE_OWN_ACCOUNT_ONLY = 'Вы можете деактивировать только свой собственный аккаунт.';
export const MAIL_DELIVERY_MESSAGE =
    'Если адрес указан верно, письмо с инструкцией по сбросу паролям придет в течение нескольких минут.';
export const TOKEN_INVALID = 'Неверный токен или cрок действия его истек.';
export const PASSWORD_RESET_SUCCESS = 'Пароль успешно изменен.';
export const RATE_LIMIT_EXCEEDED_MESSAGE = 'Вы исчерпали лимит запросов. Попробуйте позже.';
export const FORBIDDEN_RESOURCE = 'Запрещенный ресурс';
export const AUTHORIZATION_REQUIRED = 'Требуется авторизация';
export const REPRESENTATIVE_REQUEST_CREATED = 'Заявка на представителя успешно создана';
export const USER_NOT_FOUND = 'Пользователь не найден';
export const POST_NOT_FOUND = 'Публикация не найдена';
export const INVALID_ROLE = 'Недопустимая роль';
export const DISTRICT_NOT_FOUND = 'Округ не найден';
export const NOT_ENOUGH_FUNDS = 'Недостаточно билетов';
export const VOTER_PROFILE_NOT_FOUND = 'Профиль избирателя не найден';

export const COMMENT_MESSAGES = {
    DELETE_SUCCESS: 'Комментарий успешно удален',
} as const;

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
    ASSIGNEE_NOT_FOUND: 'Исполнитель не найден',
    TASK_ASSIGNEE_MUST_BE_REPRESENTATIVE: 'Исполнитель должен быть представителем',
    STAGES_ONLY_FOR_REPRESENTATIVE: 'Этапы может создавать только представитель власти',
} as const;

export const VERIFICATION_MESSAGES = {
    CODE_NOT_FOUND: 'Код подтверждения регистрации не найден',
    CODE_EXPIRED: 'Срок действия кода подтверждения регистрации истёк',
    CODE_INVALID: 'Неверный код подтверждения регистрации',
} as const;

export const DIALOG_MESSAGES = {
    NOT_FOUND: 'Диалог не найден',
    ACCESS_DENIED: 'Нет доступа к диалогу',
    NO_SUBSCRIPTION: 'Нет подписки на представителя власти',
} as const;

export const SUBSCRIPTION_MESSAGES = {
    CREATE_SUCCESS: 'Подписка успешно оформлена',
    SELF_SUBSCRIPTION: 'Нельзя подписаться на самого себя',
    INVALID_TARGET: 'Подписка возможна только на представителя власти',
    ALREADY_SUBSCRIBED: 'Вы уже подписаны на этого представителя',
} as const;

export const NOTIFICATION_MESSAGES = {
    NOT_FOUND: 'Уведомление не найдено',
    ACCESS_DENIED: 'Нет доступа к уведомлению',
    READ_SUCCESS: 'Уведомление прочитано',
    ALL_READ_SUCCESS: 'Все уведомления прочитаны',
} as const;
