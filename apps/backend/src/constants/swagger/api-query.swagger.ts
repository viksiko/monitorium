import { ApiQueryOptions } from '@nestjs/swagger';

export const USER_FILTER_QUERY_ROLE: ApiQueryOptions = {
    name: 'Параметр role',
    description: 'Фильтр по роли (voter | representative)',
    required: true,
    example: '/api/v1/users/filter?role=representative',
};

export const USER_FILTER_QUERY_DISTRICT: ApiQueryOptions = {
    name: 'Параметр district',
    description: 'Фильтр по округу',
    required: true,
    example: '/api/v1/users/filter?district=Округ №1',
};

export const TASK_FILTER_QUERY_DISTRICT: ApiQueryOptions = {
    name: 'Параметр district',
    description: 'Фильтр по округу',
    required: true,
    example: '/api/v1/tasks/filter?district=Округ №1',
};

export const DISTRICT_QUERY_AREAS: ApiQueryOptions = {
    name: 'Параметр areas',
    description: 'Список окргуов с районами',
    required: true,
    example: '/api/v1/districts?areas=true',
};
