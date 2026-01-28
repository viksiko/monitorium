import { ApiResponseOptions } from '@nestjs/swagger';

export const HEALTH_CHECK_API: ApiResponseOptions = {
    status: 200,
    description: 'Задание успешно удалено',
    schema: {
        example: {
            success: true,
            statusCode: 200,
            data: {
                status: 'ok',
            },
        },
    },
};
