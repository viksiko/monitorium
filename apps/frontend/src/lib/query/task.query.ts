import { CreateTaskDtoModel } from '../generated/models';
import { useMutation } from '@tanstack/react-query';
import { task } from '../generated/task.client';

export const useCreateTaskMutation = () => {
    return useMutation({
        mutationKey: ['createTask'],
        mutationFn: (data: CreateTaskDtoModel) => task.createTask(data),
    });
};
