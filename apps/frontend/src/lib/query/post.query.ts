import { useQuery } from '@tanstack/react-query';
import { post } from '../generated';

export const useGetPostById = (id: string) => {
    return useQuery({
        queryKey: ['post', id],
        queryFn: () => post.getPostById(id),
    });
};
