import { useGetUser } from '@/lib/query/user.query';
import { Comment } from '@monorepo/types';
import { Author } from '../common/Author';
import { CommentComponentContext, useCommentComponentContext } from './CommentComponentContext';

// SINGLE COMMENT COMPONENTS

export const CommentRoot = ({ comment, children }: { comment: Comment; children: React.ReactNode }) => {
    return (
        <CommentComponentContext.Provider value={{ comment }}>
            <div className="flex-col gap-2">{children}</div>
        </CommentComponentContext.Provider>
    );
};

export const CommentHeader = () => {
    const { comment } = useCommentComponentContext();
    const { data: user } = useGetUser(comment.authorId);

    const updateTimeHHMM = comment.updatedAt.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex-row gap-2">
            <Author size="small">
                <Author.Name name={user.name}>
                    <Author.RoleIcon role={user.role} />
                </Author.Name>
            </Author>
            <span className="text-sm text-honor-darkGray">{updateTimeHHMM}</span>
        </div>
    );
};

export const CommentContent = () => {
    const { comment } = useCommentComponentContext();
    return <p>{comment.content}</p>;
};

export const CommentComponent = Object.assign(CommentRoot, {
    Content: CommentContent,
    Header: CommentHeader,
});
