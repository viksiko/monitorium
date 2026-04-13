export interface Task {
    id: string;
    title: string;
    address: string;
    district: District;
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
}

interface Author {
    id: string;
    name: string;
}

interface Assignee {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
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
    | 'district'
    | 'desiredResolutionDate'
    | 'status'
    | 'createdAt'
    | 'likesCount'
    | 'viewsCount'
    | 'author'
    | 'assignee'
>;
