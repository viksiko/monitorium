import { useQuery } from '@tanstack/react-query';
import { comment } from '../generated/comment.client';
import { CommentOriginType } from '@monorepo/types';

export const useGetComments = (id: string, type: CommentOriginType) => {
    return useQuery({
        queryKey: ['comments', type, id],
        queryFn: () => {
            switch (type) {
                case 'post':
                    return comment.getComments({ postId: id });
                case 'task':
                    return comment.getComments({ taskId: id });
            }
        },
    });
};
