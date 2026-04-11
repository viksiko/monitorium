/**
 * HTTP-клиент для UserController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type {
    UserModel,
    UserResponseModel,
    UserWithRepresentativeProfileDtoModel,
    UserWithVoterProfileDtoModel,
    UsersFilterDtoModel,
} from './models/index';
import type { YearTasksData } from '@monorepo/types';

export const user = {
    getAllUsers: async () => {
        return customInstance<UserModel[]>({
            url: `/api/v1/users`,
            method: 'GET',
        });
    },
    getUsersByFilter: async (query: UsersFilterDtoModel) => {
        return customInstance<UserWithRepresentativeProfileDtoModel[] | UserWithVoterProfileDtoModel[]>({
            url: `/api/v1/users/filter`,
            method: 'GET',
            params: query,
        });
    },
    getUserProfile: async () => {
        return customInstance<UserResponseModel>({
            url: `/api/v1/users/profile`,
            method: 'GET',
        });
    },
    getUserStatistics: async () => {
        return customInstance<YearTasksData[]>({
            url: `/api/v1/users/statistics`,
            method: 'GET',
        });
    },
    getUserById: async (id: string) => {
        return customInstance<UserResponseModel>({
            url: `/api/v1/users/${encodeURIComponent(String(id))}`,
            method: 'GET',
        });
    },
    deactivateUser: async (id: string) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/users/${encodeURIComponent(String(id))}/deactivate`,
            method: 'PATCH',
        });
    },
} as const;
