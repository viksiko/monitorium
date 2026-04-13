import { useQuery } from '@tanstack/react-query';
import { app } from '../generated';

export const useGetHealth = () => {
    return useQuery({
        queryKey: ['health'],
        queryFn: () => app.healthCheck(),
    });
};
