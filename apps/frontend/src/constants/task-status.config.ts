import { TaskStatus } from '@monorepo/types';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
    PLANNED: {
        label: 'Запланировано',
        className: 'bg-orange-100 text-orange-800',
    },
    IN_PROGRESS: {
        label: 'В процессе',
        className: 'bg-blue-100 text-blue-800',
    },
    COMPLETED: {
        label: 'Выполнено',
        className: 'bg-green-100 text-green-800',
    },
    REJECTED: {
        label: 'Отклонено',
        className: 'bg-red-100 text-red-800',
    },
};
