export interface Task {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string | null;
    desiredResolutionDate?: Date | string | null; // или Date, если будет преобразование
    authorId: string;
    author: Author;
    assignee?: Assignee | null;
    status: TaskStatus; // enum для статусов
    createdAt: Date | string; // или Date
    updatedAt: Date | string; // или Date
    stages?: TaskStage[];
    likesCount: number;
    viewsCount: number;
    comments?: TaskComment[];
}

interface Author {
    id: string;
    name: string;
}

interface Assignee {
    id: string;
    name: string;
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: Date | string;
}

export const TASK_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface TaskStage {
    id: string;
    taskId: string;
    title: string;
    date: Date | string; // или Date, если будет преобразование
    createdAt: Date | string; // или Date
    isCompleted: boolean;
    updatedAt?: Date | string; // или Date
}

export type TaskListItem = Pick<
    Task,
    | 'id'
    | 'title'
    | 'address'
    | 'desiredResolutionDate'
    | 'status'
    | 'createdAt'
    | 'likesCount'
    | 'viewsCount'
    | 'comments'
    | 'author'
    | 'assignee'
>;
