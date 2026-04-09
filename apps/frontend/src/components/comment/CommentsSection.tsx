import { useGetComments } from '@/lib/query/comment.query';
import { CommentOriginType } from '@monorepo/types';
import { useRef } from 'react';
import { CommentSectionContext, CommentSectionFormState, useCommentSectionContext } from './CommentsSectionContext';
import { Comment } from '@monorepo/types';
import { cn } from '@/lib/utils';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { CommentsForm, CommentsFormInput, CommentsFormSendButton } from './CommentsSectionForm.tsx';

// ЗДЕСЬ РАСПОЛОЖЕНЫ КОМПОНЕНТЫ ДЛЯ РАБОТЫ С КОММЕНТАРИЯМИ

export interface CommentsSectionProps {
    originId: string;
    type: CommentOriginType;
    children: React.ReactNode;
    className?: string;
}

export const CommentsSectionRoot = ({ originId, type, children, className }: CommentsSectionProps) => {
    const storeRef = useRef<UseBoundStore<StoreApi<CommentSectionFormState>> | null>(null);
    if (!storeRef.current) {
        storeRef.current = create<CommentSectionFormState>((set) => ({
            content: '',
            changeContent: (content) => set({ content }),
            clearContent: () => set({ content: '' }),
        }));
    }
    const formStore = storeRef.current;

    const context: CommentSectionContext = {
        originId,
        type,
        formStore,
    };

    return (
        <CommentSectionContext.Provider value={context}>
            <div className={cn('mt-2 mb-2 p-1', className)}>{children}</div>
        </CommentSectionContext.Provider>
    );
};

export interface CommentsSectionListProps {
    className?: string;
    renderComment: (comment: Comment) => React.ReactNode;
}
export const CommentsSectionList = ({ className, renderComment }: CommentsSectionListProps) => {
    const { originId, type } = useCommentSectionContext();
    const { data: comments, isLoading } = useGetComments(originId, type);

    if (isLoading) return <p>Загрузка комментариев...</p>;

    if (!comments) return <p>Комментариев нет</p>;

    return <div className={cn('flex-col gap-2', className)}>{comments.map((comment) => renderComment(comment))}</div>;
};

export const CommentsSection = Object.assign(CommentsSectionRoot, {
    List: CommentsSectionList,
    Form: CommentsForm,
    Input: CommentsFormInput,
    SendButton: CommentsFormSendButton,
});
