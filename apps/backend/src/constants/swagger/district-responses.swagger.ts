import { ApiResponseOptions } from '@nestjs/swagger';
import { DISTRICT_NOT_FOUND } from '../api-messages.constants';

export const GET_ALL_DISTRICTS_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Успешное получение списка округов',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Список только округов',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                name: 'Округ №1',
                                mapId: 1,
                                createdAt: '2026-03-30T18:34:41.395Z',
                                updatedAt: '2026-03-30T18:34:41.395Z',
                            },
                            {
                                id: '7fe08604-764c-4d5e-b5d1-8f905bc0e1a6',
                                name: 'Округ №2',
                                mapId: 2,
                                createdAt: '2026-03-30T18:34:41.395Z',
                                updatedAt: '2026-03-30T18:34:41.395Z',
                            },
                        ],
                    },
                },
                b: {
                    summary: 'Список окргуов с районами',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                name: 'Округ №1',
                                mapId: 1,
                                createdAt: '2026-03-30T18:34:41.395Z',
                                updatedAt: '2026-03-30T18:34:41.395Z',
                                areas: [
                                    {
                                        id: 'c58089cf-8d07-432f-b1ef-2adcae0a1989',
                                        name: 'Славгород',
                                        districtId: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                    {
                                        id: 'f84f5b44-cd18-4b19-b82b-c8b1be663593',
                                        name: 'Яровое',
                                        districtId: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                    {
                                        id: '20172541-b1b1-4d1f-80fe-31b67989e1d8',
                                        name: 'Бурлинский район',
                                        districtId: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                    {
                                        id: '2d38cab6-70a2-4daa-bc26-14ff501e1e06',
                                        name: 'Табунский район',
                                        districtId: '45747643-0d19-4ee3-9c9e-ae9bdfdb78a5',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                ],
                            },
                            {
                                id: 'd3dd8ec1-3485-46df-8e11-a80b509828ef',
                                name: 'Округ №10',
                                mapId: 2,
                                createdAt: '2026-03-30T18:34:41.395Z',
                                updatedAt: '2026-03-30T18:34:41.395Z',
                                areas: [
                                    {
                                        id: '4566bcd7-8023-49f8-9a47-e882cc370437',
                                        name: 'Павловский район',
                                        districtId: 'd3dd8ec1-3485-46df-8e11-a80b509828ef',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                    {
                                        id: '7f63e3fe-a261-4acf-afcf-2bd501392002',
                                        name: 'Ребрихинский район',
                                        districtId: 'd3dd8ec1-3485-46df-8e11-a80b509828ef',
                                        createdAt: '2026-03-30T18:34:41.395Z',
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    },
};

export const DISTRICT_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Округ не найден',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: DISTRICT_NOT_FOUND,
            },
        },
    },
};
