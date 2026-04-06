/** @generated */

import type { TaskCommentModel } from './TaskCommentModel';
import type { TaskFileModel } from './TaskFileModel';
import type { TaskStageModel } from './TaskStageModel';
import type { TaskStatus } from './TaskStatus';
import type { UserModel } from './UserModel';

export interface TaskModel {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string | null;
    desiredResolutionDate?: Date | null;
    userId: string;
    status: TaskStatus;
    likesCount: number;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
    stages?: TaskStageModel[];
    comments?: TaskCommentModel[];
    taskFiles?: TaskFileModel[];
}
