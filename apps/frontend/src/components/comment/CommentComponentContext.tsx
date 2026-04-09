import { createContext, useContext } from 'react';
import { Comment } from '@monorepo/types';

export interface CommentComponentContext {
    comment: Comment;
}

export const CommentComponentContext = createContext<CommentComponentContext | null>(null);

export const useCommentComponentContext = () => {
    const context = useContext(CommentComponentContext);
    if (!context) {
        throw new Error('useCommentComponentContext must be used within a CommentComponentContext');
    }
    return context;
};
