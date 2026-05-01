import { useGetUser } from '@/lib/query/user.query';
import { Comment } from '@monorepo/types';
import { Author } from '../common/Author';
import { CommentComponentContext, useCommentComponentContext } from './CommentComponentContext';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

// SINGLE COMMENT COMPONENTS

export const CommentRoot = ({
    comment,
    children,
    className,
}: {
    comment: Comment;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <CommentComponentContext.Provider value={{ comment }}>
            <div className={cn('flex-col gap-2 mb-1', className)}>{children}</div>
        </CommentComponentContext.Provider>
    );
};

export const CommentHeader = () => {
    const { comment } = useCommentComponentContext();
    const { data: user, isLoading, isPending, isError } = useGetUser(comment.authorId);

    const createDate = new Date(comment.createdAt);
    const createTimeFormatted = Number.isNaN(createDate.getTime())
        ? String(comment.createdAt)
        : createDate
              .toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
              })
              .replace(',', '')
              .replace(/\//g, '.');

    if (isLoading || isPending) {
        return (
            <div className="flex-row gap-2 items-center">
                <Skeleton
                    className="h-4 rounded-md"
                    size="medium"
                />
                <Skeleton
                    className="h-3 rounded-md"
                    size="short"
                />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex-row gap-2 items-center">
                <span className="text-sm text-honor-darkGray">Пользователь недоступен</span>
                <span className="text-sm text-honor-darkGray">{createTimeFormatted}</span>
            </div>
        );
    }

    return (
        <div className="flex-row gap-2">
            <Author size="small">
                <Author.Name name={user.name}>
                    <Author.RoleIcon role={user.role} />
                    <span className="text-sm text-honor-darkGray">{createTimeFormatted}</span>
                </Author.Name>
            </Author>
        </div>
    );
};

export const CommentContent = () => {
    const { comment } = useCommentComponentContext();
    return <p className="mb-3 rounded-md text-sm leading-relaxed text-foreground italic">{comment.content}</p>;
};

export const CommentComponent = Object.assign(CommentRoot, {
    Content: CommentContent,
    Header: CommentHeader,
});
