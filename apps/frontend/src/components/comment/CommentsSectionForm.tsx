import { invalidateComments, useCreateComment } from '@/lib/query/comment.query';
import { validateCommentContent } from '@monorepo/types';
import { createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCommentSectionContext } from './CommentsSectionContext';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader, SendHorizonal } from 'lucide-react';

export interface CommentsFormProps {
    className?: string;
    children?: React.ReactNode;
}

interface CommentsFormState {
    disabled: boolean;
    isPending: boolean;
}

const CommentsFormContext = createContext<CommentsFormState | null>(null);

const useCommentsFormContext = () => {
    const context = useContext(CommentsFormContext);
    if (!context) {
        throw new Error('CommentsSection.SendButton should be used inside CommentsSection.Form');
    }
    return context;
};

export const CommentsForm = ({ className, children }: CommentsFormProps) => {
    const queryClient = useQueryClient();
    const { originId, type, formStore } = useCommentSectionContext();
    const content = formStore((state) => state.content);
    const clearContent = formStore((state) => state.clearContent);
    const { isPaused, isPending, mutate } = useCreateComment(originId, type, content);
    const { toast } = useToast();

    const disabled = useMemo(() => {
        if (!validateCommentContent(content)) {
            return true;
        }
        return isPaused || isPending;
    }, [content, isPaused, isPending]);

    const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        if (disabled) {
            return;
        }

        mutate(null, {
            onSuccess: async () => {
                clearContent();
                await invalidateComments(queryClient, originId, type);
                toast({
                    title: 'Комментарий добавлен',
                    description: 'Комментарий добавлен успешно',
                    variant: 'success',
                });
            },
            onError: (error: Error) => {
                console.error(error);
                toast({
                    title: 'Ошибка',
                    description: error.message,
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <CommentsFormContext.Provider value={{ disabled, isPending }}>
            <form
                className={cn('flex flex-row gap-2', className)}
                onSubmit={onSubmit}>
                {children}
            </form>
        </CommentsFormContext.Provider>
    );
};

export interface CommentsFormInputProps {
    className?: string;
}

export const CommentsFormInput = ({ className }: CommentsFormInputProps) => {
    const { formStore } = useCommentSectionContext();
    const content = formStore((state) => state.content);
    const changeContent = formStore((state) => state.changeContent);

    return (
        <Input
            className={className}
            placeholder="Напишите комментарий..."
            value={content}
            onChange={(e) => changeContent(e.target.value)}
        />
    );
};

export interface CommentsFormSendButtonProps {
    className?: string;
}

export const CommentsFormSendButton = ({ className }: CommentsFormSendButtonProps) => {
    const { disabled, isPending } = useCommentsFormContext();

    return (
        <Button
            type="submit"
            disabled={disabled}
            className={className}>
            <span className="mr-2">Отправить</span>
            {isPending ? <Loader className="h-8 w-8 animate-spin" /> : <SendHorizonal className="h-8 w-8" />}
        </Button>
    );
};
