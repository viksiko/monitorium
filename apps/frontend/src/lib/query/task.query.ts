import { useQuery } from '@tanstack/react-query';
import { task } from '../generated';

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
