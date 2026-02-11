import { ApiResponseOptions } from '@nestjs/swagger';
import {
    DEACTIVATE_OWN_ACCOUNT_ONLY,
    USER_DEACTIVATED_SUCCESS,
    USER_NOT_FOUND_MSG,
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
                    summary: USER_NOT_FOUND_MSG,
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

export const GET_CURRENT_USER_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Удачная попытка получения данных текущего пользователяl',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Данные представителя власти',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: {
                            id: 'rep_5f1a2b3c4d5e6f7890',
                            name: 'Иванов Алексей Сергеевич',
                            email: 'a.ivanov@duma.gov.ru',
                            phone: '+7 (495) 123-45-67',
                            role: 'REPRESENTATIVE',
                            isRepresentative: true,
                            isVerified: true,
                            representativeProfile: {
                                id: 'rpr_7g8h9i0j1k2l3m4n5',
                                position: 'Депутат Государственной Думы',
                                party: 'Единая Россия',
                                rating: 4.5,
                                tasksTotal: 42,
                                tasksCompleted: 36,
                                attendance: 89,
                                lastActivity: '2024-01-15T14:30:00Z',
                            },
                            subscriptions: [],
                            voterProfile: null,
                        },
                    },
                },
                b: {
                    summary: 'Данные избирателя',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: {
                            id: 'usr_5f1a2b3c4d5e6f',
                            name: 'Иванов Сергей Петрович',
                            email: 'sergey.ivanov@mail.ru',
                            phone: '+7 (916) 123-45-67',
                            role: 'VOTER',
                            isRepresentative: false,
                            isVerified: true,
                            representativeProfile: null,
                            voterProfile: {
                                id: 'vot_7g8h9i0j1k2l3',
                                balance: 1500,
                            },
                            subscriptions: [
                                {
                                    id: 'sub_9m8n7b6v5c4x3',
                                    createdAt: '2024-01-10T14:20:00Z',
                                    representative: {
                                        id: 'rep_1q2w3e4r5t6y7',
                                        name: 'Петров Алексей Викторович',
                                        representativeProfile: {
                                            id: 'rpr_2w3e4r5t6y7u8',
                                            position:
                                                'Депутат Государственной Думы',
                                            party: 'Единая Россия',
                                            rating: 4.5,
                                        },
                                    },
                                },
                                {
                                    id: 'sub_8n7m6b5v4c3x2',
                                    createdAt: '2024-01-12T11:15:00Z',
                                    representative: {
                                        id: 'rep_9i8u7y6t5r4e3',
                                        name: 'Сидорова Мария Ивановна',
                                        representativeProfile: {
                                            id: 'rpr_1w2e3r4t5y6u7',
                                            position: 'Член Совета Федерации',
                                            party: 'Справедливая Россия',
                                            rating: 4.8,
                                        },
                                    },
                                },
                            ],
                        },
                    },
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
