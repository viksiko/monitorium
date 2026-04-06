/**
 * HTTP-клиент для CommentController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type {
    CreateCommentDtoModel,
    DeleteCommentDtoModel,
    EditCommentDtoModel,
    GetCommentsDtoModel,
} from './models/index';
import type { Comment } from '@monorepo/types';

export const comment = {
    createComment: async (dto: CreateCommentDtoModel) => {
        return customInstance<Comment>({
            url: `/api/v1/comments`,
            method: 'POST',
            data: dto,
        });
    },
    getComments: async (dtoQuery: GetCommentsDtoModel) => {
        return customInstance<Comment[]>({
            url: `/api/v1/comments`,
            method: 'GET',
            params: dtoQuery,
        });
    },
    editComment: async (dto: EditCommentDtoModel) => {
        return customInstance<Comment>({
            url: `/api/v1/comments`,
            method: 'PATCH',
            data: dto,
        });
    },
    deleteComment: async (dto: DeleteCommentDtoModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/comments`,
            method: 'DELETE',
            params: dto,
        });
    },
} as const;
