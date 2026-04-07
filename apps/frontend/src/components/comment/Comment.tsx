import { Comment } from '@monorepo/types';
import { CreateCommentDtoModel, EditCommentDtoModel, DeleteCommentDtoModel } from '@/lib/generated/models';
import { useGetComments } from '@/lib/query/comment.query';
import { CommentOriginType } from '@monorepo/types';
import { createContext, useContext, useState } from 'react';
import { useGetUser } from '@/lib/query/user.query';

// ЗДЕСЬ РАСПОЛОЖЕНЫ КОМПОНЕНТЫ ДЛЯ РАБОТЫ С КОММЕНТАРИЯМИ

export interface CommentSectionContext {
    id: string;
    type: CommentOriginType;
    comments: Comment[];
    send: (dto: CreateCommentDtoModel) => void;
    edit: (dto: EditCommentDtoModel) => void;
    remove: (dto: DeleteCommentDtoModel) => void;
}

export const CommentSectionContext = createContext<CommentSectionContext | null>(null);

export const useCommentSectionContext = () => {
    const context = useContext(CommentSectionContext);
    if (!context) {
        throw new Error('useCommentSectionContext must be used within a CommentSectionContext');
    }
    return context;
};

export const CommentSection = ({
    id,
    type,
    children,
}: {
    id: string;
    type: CommentOriginType;
    children: React.ReactNode;
}) => {
    const { data: comments } = useGetComments(id, type);

    const context: CommentSectionContext = {
        id,
        type,
        comments,
        send: (dto: CreateCommentDtoModel) => {
            // comment.createComment(dto);
        },
        edit: (dto: EditCommentDtoModel) => {
            // comment.editComment(dto);
        },
        remove: (dto: DeleteCommentDtoModel) => {
            // comment.deleteComment(dto);
        },
    };

    return <CommentSectionContext.Provider value={context}>{children}</CommentSectionContext.Provider>;
};

export const CommentContent = ({ comment, children }: { comment: Comment; children: React.ReactNode }) => {
    return <p>{comment.content}</p>;
};

// export const CommentHeader = ({ comment }: { comment: Comment }) => {
//     const { data: user } = useGetUser(comment.authorId);

//     if (!user) {
//         return null;
//     }

//     // const isDeputy

//     return (
//         null
//     )
// }
