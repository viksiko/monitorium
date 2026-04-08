import { CreateCommentDtoModel, EditCommentDtoModel, DeleteCommentDtoModel } from '@/lib/generated/models';
import { CommentOriginType } from '@monorepo/types';
import { createContext, useContext } from 'react';
import { Comment } from '@monorepo/types';
import { create, StoreApi, UseBoundStore } from 'zustand';

export interface CommentSectionFormState {
    content: string;
    changeContent: (content: string) => void;
    clearContent: () => void;
}

export interface CommentSectionContext {
    originId: string;
    type: CommentOriginType;
    formStore: UseBoundStore<StoreApi<CommentSectionFormState>>;
}

export const CommentSectionContext = createContext<CommentSectionContext | null>(null);

export const useCommentSectionContext = () => {
    const context = useContext(CommentSectionContext);
    if (!context) {
        throw new Error('useCommentSectionContext must be used within a CommentSectionContext');
    }
    return context;
};
