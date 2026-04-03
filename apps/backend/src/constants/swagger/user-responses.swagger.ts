import { ApiResponseOptions } from '@nestjs/swagger';
import { DEACTIVATE_OWN_ACCOUNT_ONLY, USER_DEACTIVATED_SUCCESS, USER_NOT_FOUND } from '../api-messages.constants';
import { BAD_REQUEST_PARAM } from './api-param.swagger';

export const USER_LIST_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Cписок всех пользователей',
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
                                id: 'cmlw502tu00007gjfo3yn4pdn',
                                name: 'Иванов Сергей',
                                email: 'nimaxa@mailinator.com',
                                phone: '19755788615',
                                district: null,
                                role: 'REPRESENTATIVE',
                                gosuslugiId: null,
                                sberId: null,
                                tinkoffId: null,
                                isRepresentative: false,
                                isVerified: false,
                                isActive: true,
                                deletedAt: null,
                                createdAt: '2026-02-21T09:49:18.546Z',
                                updatedAt: '2026-02-21T09:49:18.546Z',
                            },
                            {
                                id: 'cmly1ul430001i4jfvmfbtkog',
                                name: 'Петров Алексей',
                                email: 'xefibi@mailinator.com',
                                phone: '13813851411',
                                district: null,
                                role: 'REPRESENTATIVE',
                                gosuslugiId: null,
                                sberId: null,
                                tinkoffId: null,
                                isRepresentative: true,
                                isVerified: true,
                                isActive: true,
                                deletedAt: null,
                                createdAt: '2026-02-22T17:56:35.811Z',
                                updatedAt: '2026-02-22T17:56:52.838Z',
                            },
                        ],
                    },
                },
                UserNotFound: {
                    summary: 'Пользователи не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [],
                    },
                },
            },
        },
    },
};

export const USER_FILTER_LIST_SUCCESS_RESPONSE: ApiResponseOptions = {
    status: 200,
    description: 'Cписок пользователей по фильтру',
    content: {
        'application/json': {
            examples: {
                UsersFilterRoleRepresentative: {
                    summary: 'Пользователи с ролью представителя власти',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmly1ul430001i4jfvmfbtkog',
                                name: 'Петров Алексей',
                                email: 'xefibi@mailinator.com',
                                phone: '13813851411',
                                district: null,
                                isVerified: true,
                                representativeProfile: {
                                    id: 'cmly1uy950003i4jf0xczym6m',
                                    position: 'Депутат Государственной Думы',
                                    party: 'er',
                                    bio: 'Aut cupiditate nisi ',
                                    rating: 0,
                                    tasksTotal: 0,
                                    tasksCompleted: 0,
                                    attendance: 0,
                                    lastActivity: null,
                                },
                                voterProfile: null,
                            },
                            {
                                id: 'cmlw5eb1z0000ywjfohd3nni2',
                                name: 'Сидорова Мария',
                                email: 'tojagax@mailinator.com',
                                phone: '16979619121',
                                district: null,
                                isVerified: true,
                                representativeProfile: {
                                    id: 'cmlw5er040002ywjfhic1r0wa',
                                    position: 'Член Совета Федерации',
                                    party: 'other',
                                    bio: 'Sunt rem labore ius',
                                    rating: 0,
                                    tasksTotal: 0,
                                    tasksCompleted: 0,
                                    attendance: 0,
                                    lastActivity: null,
                                },
                                voterProfile: null,
                            },
                        ],
                    },
                },
                UsersFilterRoleVoter: {
                    summary: 'Пользователи с ролью избирателя',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [
                            {
                                id: 'cmlw502tu00007gjfo3yn4pdn',
                                name: 'Иванов Сергей',
                                email: 'nimaxa@mailinator.com',
                                phone: '19755788615',
                                district: null,
                                isVerified: false,
                                representativeProfile: null,
                                voterProfile: {
                                    id: 'cmlw502u600017gjf4ykzsbk1',
                                    userId: 'cmlw502tu00007gjfo3yn4pdn',
                                },
                            },
                            {
                                id: 'cmlznbcj00003gwjf14yuwh3c',
                                name: 'Петров Алексей',
                                email: 'xuxozojodu@mailinator.com',
                                phone: '14389185046',
                                district: null,
                                isVerified: true,
                                representativeProfile: null,
                                voterProfile: {
                                    id: 'cmlznbcj20004gwjff4h6yyiy',
                                    userId: 'cmlznbcj00003gwjf14yuwh3c',
                                },
                            },
                        ],
                    },
                },
                UserNotFound: {
                    summary: 'Пользователи не найдены',
                    value: {
                        success: true,
                        statusCode: 200,
                        data: [],
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
    description: 'Данные пользователя',
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
                                            position: 'Депутат Государственной Думы',
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

// export const USER_BAD_REQUEST_RESPONSE: ApiResponseOptions = {
//     status: 400,
//     description: 'Неверный параметр запроса',
//     schema: {
//         example: {
//             success: false,
//             statusCode: 400,
//             data: {
//                 message: ['Указана недопустимая роль'],
//             },
//         },
//     },
// };

export const USER_BAD_REQUEST_RESPONSE: ApiResponseOptions = {
    status: 400,
    description: 'Неверный параметр запроса',
    content: {
        'application/json': {
            examples: {
                a: {
                    summary: 'Указан неверный параметр',
                    value: BAD_REQUEST_PARAM,
                },
                b: {
                    summary: 'Указана неверная роль',
                    value: {
                        success: false,
                        statusCode: 400,
                        data: {
                            message: ['Указана недопустимая роль'],
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

export const USER_NOT_FOUND_RESPONSE: ApiResponseOptions = {
    status: 404,
    description: 'Пользователь не найден',
    schema: {
        example: {
            success: false,
            statusCode: 404,
            data: {
                message: USER_NOT_FOUND,
            },
        },
    },
};
