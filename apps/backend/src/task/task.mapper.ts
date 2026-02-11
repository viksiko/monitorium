import { TaskListItem, TaskStatus } from '@monorepo/types';
import { $Enums, Task } from '@prisma/client';

// маппер enum
export const mapTaskStatus = (status: $Enums.TaskStatus): TaskStatus => {
    switch (status) {
        case 'PLANNED':
            return TaskStatus.PLANNED;
        case 'IN_PROGRESS':
            return TaskStatus.IN_PROGRESS;
        case 'COMPLETED':
            return TaskStatus.COMPLETED;
        case 'REJECTED':
            return TaskStatus.REJECTED;
    }
};

// маппер всей строки для списка
export const mapTaskListItemToDto = (task: Task): TaskListItem => ({
    id: task.id,
    title: task.title,
    address: task.address,
    desiredResolutionDate: task.desiredResolutionDate
        ? task.desiredResolutionDate.toISOString()
        : undefined,
    likesCount: task.likesCount,
    viewsCount: task.viewsCount,
    status: mapTaskStatus(task.status),
    createdAt: task.createdAt.toISOString(),
});
