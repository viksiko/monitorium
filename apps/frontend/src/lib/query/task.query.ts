import { useMutation, useQuery } from '@tanstack/react-query';
import { task } from '../generated';
import { CreateTaskDtoModel } from '../generated/models';

export const useGetTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: () => task.getTasks(),
    });
};

export const useGetLatestTasks = () => {
    return useQuery({
        queryKey: ['tasks', 'latest'],
        queryFn: () => task.getLatestTasks(),
    });
};


export const useCreateTaskMutation = () => {
    return useMutation({
        mutationKey: ['createTask'],
        mutationFn: (data: CreateTaskDtoModel) => task.createTask(data),
    });
};
