export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title?: string | null;
    message?: string | null;
    subscriptionId?: string | null;
    taskId?: string | null;
    postId?: string | null;
    isRead: boolean;
    commentId?: string | null;
    messageId?: string | null;
    createdAt: Date;
}

export interface NotificationItem {
    id: string;
    userId: string;
    type: NotificationType;
    title?: string | null;
    message?: string | null;
    subscriptionId?: string | null;
    taskId?: string | null;
    postId?: string | null;
    isRead: boolean;
    commentId?: string | null;
    messageId?: string | null;
    createdAt: Date;

    subscription?: {
        subscriber: {
            name: string;
        };
    } | null;

    task?: {
        title: string;
    } | null;

    post?: {
        title: string;
        author: {
            name: string;
        };
    } | null;
}

// export enum NotificationType {
//     NEW_SUBSCRIBER = 'NEW_SUBSCRIBER',
//     NEW_TASK_ASSIGNED = 'NEW_TASK_ASSIGNED',
//     TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
//     NEW_POST = 'NEW_POST',
//     NEW_COMMENT = 'NEW_COMMENT',
//     NEW_MESSAGE = 'NEW_MESSAGE',
// }

export const NotificationTypeMap = {
    NEW_SUBSCRIBER: 'NEW_SUBSCRIBER',
    NEW_TASK_ASSIGNED: 'NEW_TASK_ASSIGNED',
    TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
    NEW_POST: 'NEW_POST',
    NEW_COMMENT: 'NEW_COMMENT',
    NEW_MESSAGE: 'NEW_MESSAGE',
} as const;

// для бэкэнда, что бы призма не ругалась
export type NotificationType = keyof typeof NotificationTypeMap;
