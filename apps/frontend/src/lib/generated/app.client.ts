/**
 * HTTP-клиент для AppController
 * @generated
 */

import { customInstance } from '@/lib/mutator';

export const app = {
    healthCheck: async () => {
        return customInstance<{
            status: string;
            service: string;
        }>({
            url: `/api/v1/health`,
            method: 'GET',
        });
    },
} as const;
