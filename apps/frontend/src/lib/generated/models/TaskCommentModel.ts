/** @generated */

import type { TaskModel } from './TaskModel';
import type { UserModel } from './UserModel';

export interface TaskCommentModel {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: Date;
    task?: TaskModel;
    user?: UserModel;
}
