export type Comment = {
    id: string;
    content: string;

    createdAt: Date;
    updatedAt: Date;

    authorId: string;

    postId?: string | null;
    taskId?: string | null;
}

export type CommentOriginType = 'post' | 'task';

export type PostComment = Comment & {
    postId: string;
}

export type TaskComment = Comment & {
    taskId: string;
}

/**
 * Проверяет принадлежность комментария к посту
 * @param comment - Комментарий
 * @returns true, если комментарий принадлежит к посту, false в противном случае
 */
export function isPostComment(comment: Comment): comment is PostComment {
    return 'postId' in comment && comment.postId !== null;
}

/**
 * Проверяет принадлежность комментария к задаче
 * @param comment - Комментарий
 * @returns true, если комментарий принадлежит к задаче, false в противном случае
 */
export function isTaskComment(comment: Comment): comment is TaskComment {
    return 'taskId' in comment && comment.taskId !== null;
}

/**
 * Проверяет содержимое комментария на пустоту
 * @param content - Содержимое комментария
 * @returns true, если содержимое комментария не пустое, false в противном случае
 */
export function validateCommentContent(content: string): boolean {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
        return false;
    }
    return true;
}