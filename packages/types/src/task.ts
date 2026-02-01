export interface Task {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string;
    desiredResolutionDate?: string; // или Date, если будет преобразование
    userId: string;
    status: TaskStatus; // enum для статусов
    ikes: number; // исправлено с "ikes" на "likes" (вероятно опечатка в JSON)
    createdAt: string; // или Date
    updatedAt: string; // или Date
    stages?: TaskStage[];
    comments?: number;
    views?: number;
}

export enum TaskStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface TaskStage {
    id: string;
    taskId: string;
    title: string;
    date: string; // или Date, если будет преобразование
    createdAt: string; // или Date
    completed: boolean;
    updatedAt: string; // или Date
}

export type TaskListItem = Pick<
    Task,
    | 'id'
    | 'title'
    | 'address'
    | 'desiredResolutionDate'
    | 'ikes'
    | 'status'
    | 'createdAt'
>;