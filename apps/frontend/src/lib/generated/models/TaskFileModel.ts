/** @generated */

import type { TaskModel } from './TaskModel';

export interface TaskFileModel {
    id: string;
    taskId: string;
    url: string;
    name?: string | null;
    type?: string | null;
    size?: number | null;
    createdAt: Date;
    task?: TaskModel;
}
