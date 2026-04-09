import { CommentComponent } from './CommentComponent';
import { CommentsSection } from './CommentsSection';

interface TaskCommentsSectionProps {
    taskId: string;
    className?: string;
}

export const TaskCommentsSection = ({ taskId, className }: TaskCommentsSectionProps) => {
    return (
        <CommentsSection
            originId={taskId}
            type="task"
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
