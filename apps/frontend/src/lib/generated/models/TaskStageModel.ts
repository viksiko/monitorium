/** @generated */

import type { TaskModel } from './TaskModel';

export interface TaskStageModel {
    id: string;
    taskId: string;
    title: string;
    date: Date;
    createdAt: Date;
    task?: TaskModel;
}
