import { CreateCommentDtoModel, EditCommentDtoModel, DeleteCommentDtoModel } from '@/lib/generated/models';
import { useGetComments } from '@/lib/query/comment.query';
import { CommentOriginType } from '@monorepo/types';
import { createContext, useContext, useState } from 'react';
import { CommentSectionContext, useCommentSectionContext } from './CommentsSectionContext';
import { CommentComponent } from './CommentComponent';
import { Comment } from '@monorepo/types';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

// ЗДЕСЬ РАСПОЛОЖЕНЫ КОМПОНЕНТЫ ДЛЯ РАБОТЫ С КОММЕНТАРИЯМИ

export interface CommentsSectionProps {
    id: string;
    type: CommentOriginType;
    children: React.ReactNode;
    className?: string;
}

export const CommentsSectionRoot = ({ id, type, children, className }: CommentsSectionProps) => {
    const { data: comments } = useGetComments(id, type);

    const context: CommentSectionContext = {
        originId: id,
        type,
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

    return (
        <CommentSectionContext.Provider value={context}>
            <div className={cn('mt-2 mb-2 p-1', className)}>{children}</div>
        </CommentSectionContext.Provider>
    );
};

export interface CommentsSectionListProps {
    className?: string;
    CommentPropComponent: React.ComponentType<{ comment: Comment }>;
}
export const CommentsSectionList = ({ className, CommentPropComponent }: CommentsSectionListProps) => {
    const { originId, type } = useCommentSectionContext();
    const { data: comments, isLoading } = useGetComments(originId, type);

    if (isLoading) return <p>Загрузка комментариев...</p>;

    if (!comments) return <p>Комментариев нет</p>;

    return (
        <div className={cn('flex-col gap-2', className)}>
            {comments.map((comment) => (
                <CommentPropComponent
                    key={comment.id}
                    comment={comment}
                />
            ))}
        </div>
    );
};

export interface CommentsFormProps {
    className?: string;
    children: React.ReactNode;
}

export const CommentsForm = ({ className, children }: CommentsFormProps) => {
    return { children };
};

export interface CommentsFormInputProps {
    className?: string;
    children: React.ReactNode;
}
export const CommentsFormInput = ({ className, children }: CommentsFormInputProps) => {
    return <Input className={className} />;
};

export const CommentsSection = Object.assign(CommentsSectionRoot, {
    List: CommentsSectionList,
});
