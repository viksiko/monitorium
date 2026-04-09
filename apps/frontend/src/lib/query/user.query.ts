import { useQuery } from '@tanstack/react-query';
import { user } from '../generated/user.client';

export function useGetUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => user.getUserById(id),
    });
}
