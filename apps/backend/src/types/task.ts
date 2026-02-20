import { TaskStatus } from '@prisma/client';

export interface UpdateTaskData {
    possibleSolutions: string;
    desiredResolutionDate: string;
    status: TaskStatus;
}
