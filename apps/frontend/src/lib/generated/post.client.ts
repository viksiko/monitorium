/**
 * HTTP-клиент для PostController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { CreatePostDtoModel } from './models/index';
import type { Post as IPost, PostWithoutAuthor } from '@monorepo/types';

export const post = {
    createPost: async (dto: CreatePostDtoModel) => {
        return customInstance<PostWithoutAuthor>({
            url: `/api/v1/posts`,
            method: 'POST',
            data: dto,
        });
    },
    getAllPosts: async () => {
        return customInstance<PostWithoutAuthor[] | null>({
            url: `/api/v1/posts`,
            method: 'GET',
        });
    },
    getPostsByUserId: async (id: string) => {
        return customInstance<PostWithoutAuthor[] | null>({
            url: `/api/v1/posts/user/${encodeURIComponent(String(id))}`,
            method: 'GET',
        });
    },
    getPostById: async (id: string) => {
        return customInstance<IPost | null>({
            url: `/api/v1/posts/${encodeURIComponent(String(id))}`,
            method: 'GET',
        });
    },
} as const;
