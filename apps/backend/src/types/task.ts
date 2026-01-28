export interface Task {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions: string;
    desiredResolutionDate: string; // или Date, если будет преобразование
    userId: string;
    status: TaskStatus; // enum для статусов
    likes: number; // исправлено с "ikes" на "likes" (вероятно опечатка в JSON)
    createdAt: string; // или Date
    updatedAt: string; // или Date
}

export enum TaskStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export interface TaskStage {
    id: string;
    taskId: string;
    title: string;
    date: string; // или Date, если будет преобразование
    createdAt: string; // или Date
}
