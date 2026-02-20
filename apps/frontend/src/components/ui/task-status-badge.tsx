import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@monorepo/types';
import { STATUS_CONFIG } from '@/constants/task-status.config';

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
    const config = STATUS_CONFIG[status];

    return <Badge className={config.className}>{config.label}</Badge>;
};
