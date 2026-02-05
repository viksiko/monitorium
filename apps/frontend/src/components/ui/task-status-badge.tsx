import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@monorepo/types';

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> =
    {
        DELIVERED: {
            label: 'Доставлено',
            className: 'bg-purple-100 text-purple-800',
        },
        PLANNED: {
            label: 'Запланировано',
            className: 'bg-gray-100 text-gray-800',
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

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
    const config = STATUS_CONFIG[status];

    return <Badge className={config.className}>{config.label}</Badge>;
};
