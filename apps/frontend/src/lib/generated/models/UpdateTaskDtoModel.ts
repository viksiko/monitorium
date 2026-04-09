/** @generated */

import type { TaskStatus } from './TaskStatus';
import type { UpdateTaskStageDtoModel } from './UpdateTaskStageDtoModel';

export interface UpdateTaskDtoModel {
    desiredResolutionDate: string;
    possibleSolutions: string;
    status: TaskStatus;
    stages?: UpdateTaskStageDtoModel[];
    deletedStageIds?: string[];
}
