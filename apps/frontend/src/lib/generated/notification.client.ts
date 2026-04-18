/**
 * HTTP-клиент для NotificationController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { NotificationItem } from '@monorepo/types';

export const notification = {
    getNotifications: async () => {
        return customInstance<NotificationItem[]>({
            url: `/api/v1/notifications`,
            method: 'GET',
        });
    },
    readNotification: async (id: string) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/notifications/${encodeURIComponent(String(id))}/read`,
            method: 'PATCH',
        });
    },
    readAllNotifications: async () => {
        return customInstance<{ message: string }>({
            url: `/api/v1/notifications/read-all`,
            method: 'PATCH',
        });
    },
} as const;
