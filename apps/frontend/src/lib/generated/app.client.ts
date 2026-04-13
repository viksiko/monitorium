/**
 * HTTP-клиент для AppController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { HealthCheckResponse } from '@monorepo/types';

export const app = {
    healthCheck: async () => {
        return customInstance<HealthCheckResponse>({
            url: `/api/v1/health`,
            method: 'GET',
        });
    },
} as const;
