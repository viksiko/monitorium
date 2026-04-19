// components/task/TaskCreateLink.tsx
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTaskCreationGuard } from '@/hooks/useCheckSubscriptions';

interface TaskCreateLinkProps {
    className?: string;
    iconSize?: number;
    children?: React.ReactNode;
    isShowIcon?: boolean;
}

export const TaskCreateLink = ({
    className = 'flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors',
    iconSize = 20,
    children,
    isShowIcon = false,
}: TaskCreateLinkProps) => {
    const { user } = useAuth();
    const { navigateToTaskCreate } = useTaskCreationGuard();

    const handleCreateTask = () => {
        navigateToTaskCreate(user);
    };

    const hasAccess = user?.subscriptions?.length > 0 || user?.isRepresentative;

    return (
        <>
            {user && !user.isRepresentative && (
                <Link
                    to={hasAccess ? '/tasks/create' : '#'}
                    onClick={handleCreateTask}
                    className={className}>
                    {isShowIcon && (
                        <Plus
                            size={iconSize}
                            className="mr-1"
                        />
                    )}

                    <span>{children || 'Создать задание'}</span>
                </Link>
            )}
        </>
    );
};
