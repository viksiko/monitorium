/**
 * HTTP-клиент для TaskController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type {
    CreateTaskDtoModel,
    CreateTaskStageDtoModel,
    TaskModel,
    TaskStageModel,
    TasksFilterDtoModel,
    UpdateTaskDtoModel,
} from './models/index';
import type { TaskListItem } from '@monorepo/types';

export const task = {
    createTask: async (dto: CreateTaskDtoModel) => {
        return customInstance<TaskModel>({
            url: `/api/v1/tasks`,
            method: 'POST',
            data: dto,
        });
    },
    getAllTasks: async () => {
        return customInstance<TaskListItem[] | null>({
            url: `/api/v1/tasks`,
            method: 'GET',
        });
    },
    getTasksByUser: async () => {
        return customInstance<TaskListItem[]>({
            url: `/api/v1/tasks/user-tasks`,
            method: 'GET',
        });
    },
    getTasksByFilter: async (query: TasksFilterDtoModel) => {
        return customInstance<TaskModel[]>({
            url: `/api/v1/tasks/filter`,
            method: 'GET',
            params: query,
        });
    },
    getTasksByUserId: async (id: string) => {
        return customInstance<TaskListItem[]>({
            url: `/api/v1/tasks/user/${encodeURIComponent(String(id))}`,
            method: 'GET',
        });
    },
    getTaskById: async (id: string) => {
        return customInstance<TaskModel>({
            url: `/api/v1/tasks/${encodeURIComponent(String(id))}`,
            method: 'GET',
        });
    },
    remove: async (id: string) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/tasks/${encodeURIComponent(String(id))}`,
            method: 'DELETE',
        });
    },
    addStage: async (taskId: string, dto: CreateTaskStageDtoModel) => {
        return customInstance<TaskStageModel>({
            url: `/api/v1/tasks/${encodeURIComponent(String(taskId))}/stages`,
            method: 'POST',
            data: dto,
        });
    },
    getStages: async (taskId: string) => {
        return customInstance<TaskStageModel[]>({
            url: `/api/v1/tasks/${encodeURIComponent(String(taskId))}/stages`,
            method: 'GET',
        });
    },
    updateTask: async (id: string, dto: UpdateTaskDtoModel) => {
        return customInstance<TaskModel>({
            url: `/api/v1/tasks/${encodeURIComponent(String(id))}`,
            method: 'PATCH',
            data: dto,
        });
    },
} as const;
