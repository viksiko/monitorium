/** @generated */

import type { CreateTaskStageDtoModel } from './CreateTaskStageDtoModel';

export interface CreateTaskDtoModel {
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string;
    desiredResolutionDate?: Date;
    assigneeId?: string;
    stages?: CreateTaskStageDtoModel[];
}
