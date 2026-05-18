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

export function useGetSubscribers() {
    return useQuery({
        queryKey: ['userSubscribers'],
        queryFn: () => user.getSubscribers(),
    });
}

export function useGetSubscriptions() {
    return useQuery({
        queryKey: ['userSubscriptions'],
        queryFn: () => user.getSubscriptions(),
    });
}

export function useGetRepresentatives() {
    return useQuery({
        queryKey: ['userRepresentatives'],
        queryFn: () => user.getUsersByFilter({ role: 'representative' }),
    });
}
