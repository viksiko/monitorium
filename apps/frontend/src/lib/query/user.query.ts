import { useQuery } from '@tanstack/react-query';
import { user } from '../generated/user.client';

export function useGetUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => user.getUserById(id),
    });
}

export function useGetUserStatistics() {
    return useQuery({
        queryKey: ['userStatistics'],
        queryFn: () => user.getUserStatistics(),
    });
}
