export const PARAM_TASK_ID = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/tasks/{taskId}',
};

export const PARAM_TASK_ID_STAGE = {
    name: 'taskId',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/tasks/{taskId}/stages',
};

export const PARAM_TASK_USER_ID = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/tasks/{userId}',
};

export const PARAM_POST_ID = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/posts/{taskId}',
};

export const PARAM_POST_USER_ID = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/posts/{userId}',
};

export const PARAM_MESSAGE_DIALOG = {
    name: 'dialogId',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/dialogs/{dialogId}/messages',
};

export const PARAM_READ_DIALOG = {
    name: 'dialogId',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/dialogs/{dialogId}/read',
};

export const PARAM_DISTRICT_ID = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/districts/{districtId}',
};

export const PARAM_NOTIFICATION_ID_READ = {
    name: 'id',
    description: 'Обязательный параметр',
    required: true,
    type: String,
    example: '/api/v1/notifinications/{notificationId}/read',
};

export const BAD_REQUEST_PARAM = {
    success: false,
    statusCode: 400,
    data: {
        message: ['Указан недопустимый параметр "name_param"'],
    },
};
