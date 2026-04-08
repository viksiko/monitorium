import { CommentComponent } from './CommentComponent';
import { CommentsSection } from './CommentsSection';

interface PostCommentsSectionProps {
    postId: string;
    className?: string;
}

export const PostCommentsSection = ({ postId, className }: PostCommentsSectionProps) => {
    return (
        <CommentsSection
            originId={postId}
            type="post"
            className={className}>
            <CommentsSection.List
                renderComment={(comment) => (
                    <CommentComponent
                        key={comment.id}
                        comment={comment}>
                        <CommentComponent.Header />
                        <CommentComponent.Content />
                    </CommentComponent>
                )}
            />
            <CommentsSection.Form className="mt-4">
                <CommentsSection.Input />
                <CommentsSection.SendButton />
            </CommentsSection.Form>
        </CommentsSection>
    );
};
