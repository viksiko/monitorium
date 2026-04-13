import { useQuery } from '@tanstack/react-query';
import { post } from '../generated';

export const useGetPosts = () => {
    return useQuery({
        queryKey: ['posts'],
        queryFn: () => post.getPosts(),
    });
};

export const useGetLatestPosts = () => {
    return useQuery({
        queryKey: ['posts', 'latest'],
        queryFn: () => post.getLatestPosts(),
    });
};

export const useGetPostById = (id: string) => {
    return useQuery({
        queryKey: ['post', id],
        queryFn: () => post.getPostById(id),
    });
};
