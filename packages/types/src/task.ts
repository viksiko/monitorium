export interface Task {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string;
    desiredResolutionDate?: string; // или Date, если будет преобразование
    userId: string;
    status: TaskStatus; // enum для статусов
    createdAt: string; // или Date
    updatedAt: string; // или Date
    stages?: TaskStage[];
    likesCount: number;
    viewsCount: number;
    comments?: number;
}

export enum TaskStatus {
    DELIVERED = 'DELIVERED',
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
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
    | 'status'
    | 'createdAt'
    | 'likesCount'
    | 'viewsCount'
    | 'comments'
>;
