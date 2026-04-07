import { CreateCommentDtoModel, EditCommentDtoModel, DeleteCommentDtoModel } from '@/lib/generated/models';
import { CommentOriginType } from '@monorepo/types';
import { createContext, useContext } from 'react';
import { Comment } from '@monorepo/types';

export interface CommentSectionContext {
    originId: string;
    type: CommentOriginType;
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
