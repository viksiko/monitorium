/**
 * HTTP-клиент для SubscriptionController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { SubscribeDtoModel } from './models/index';

export const subscription = {
    subscribe: async (dto: SubscribeDtoModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/subscriptions`,
            method: 'POST',
            data: dto,
        });
    },
} as const;
