import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comment } from '../generated/comment.client';
import { CommentOriginType } from '@monorepo/types';

export const getCommentsQueryKey = (originId: string, type: CommentOriginType) => {
    return ['comments', type, originId];
};

export const useGetComments = (originId: string, type: CommentOriginType) => {
    return useQuery({
        queryKey: getCommentsQueryKey(originId, type),
        queryFn: () => {
            switch (type) {
                case 'post':
                    return comment.getComments({ postId: originId });
                case 'task':
                    return comment.getComments({ taskId: originId });
            }
        },
    });
};

// export const useInvalidateComments = (originId: string, type: CommentOriginType) => {
//     return useQueryClient().invalidateQueries({ queryKey: getCommentsQueryKey(originId, type) });
// };

export const invalidateComments = async (queryClient: QueryClient, originId: string, type: CommentOriginType) => {
    return queryClient.invalidateQueries({ queryKey: getCommentsQueryKey(originId, type) });
};

export const createCommentMutationKey = (originId: string, type: CommentOriginType) => {
    return ['createComment', type, originId];
};
export const useCreateComment = (originId: string, type: CommentOriginType, content: string) => {
    return useMutation({
        mutationKey: createCommentMutationKey(originId, type),
        mutationFn: () => {
            switch (type) {
                case 'post':
                    return comment.createComment({ postId: originId, content });
                case 'task':
                    return comment.createComment({ taskId: originId, content });
            }
        },
    });
};
