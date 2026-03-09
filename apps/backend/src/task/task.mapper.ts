import { TaskListItem, TaskStatus } from '@monorepo/types';
import { Task } from '@monorepo/types';
import { $Enums } from '@prisma/client';

// маппер enum
export const mapTaskStatus = (status: $Enums.TaskStatus): TaskStatus => {
    switch (status) {
        case 'PLANNED':
            return 'PLANNED';
        case 'IN_PROGRESS':
            return 'IN_PROGRESS';
        case 'COMPLETED':
            return 'COMPLETED';
        case 'REJECTED':
            return 'REJECTED';
    }
};

// маппер всей строки для списка
export const mapTaskListItemToDto = (task: Task): TaskListItem => ({
    id: task.id,
    title: task.title,
    address: task.address,
    desiredResolutionDate: task.desiredResolutionDate ? task.desiredResolutionDate : undefined,
    likesCount: task.likesCount,
    viewsCount: task.viewsCount,
    status: mapTaskStatus(task.status),
    createdAt: task.createdAt,
    author: {
        id: task.author.id,
        name: task.author.name,
    },
    assignee: task.assignee
        ? {
              id: task.assignee.id,
              name: task.assignee.name,
          }
        : null,
});
