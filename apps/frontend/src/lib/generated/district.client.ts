/**
 * HTTP-клиент для DistrictController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { DistrictModel } from './models/index';
import type { DistrictStats } from '@monorepo/types';

export const district = {
    getAllDistricts: async (areas?: string) => {
        return customInstance<DistrictModel[]>({
            url: `/api/v1/districts`,
            method: 'GET',
            params: { ...(areas != null ? { areas: areas } : {}) },
        });
    },
    getDistrictById: async (id: string) => {
        return customInstance<DistrictStats | null>({
            url: `/api/v1/districts/${encodeURIComponent(String(id))}/stats`,
            method: 'GET',
        });
    },
    getAllDistrictsShortStats: async () => {
        return customInstance<
            {
                name: string;
                mapId: number;
                tasksTotal: number;
                tasksCompleted: number;
            }[]
        >({
            url: `/api/v1/districts/short-stats`,
            method: 'GET',
        });
    },
} as const;
