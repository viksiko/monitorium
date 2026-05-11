import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTaskCreationGuard } from '@/hooks/useCheckSubscriptions';
import { Plus } from 'lucide-react';

interface TaskCreateButtonProps {
    className?: string;
    iconSize?: number;
    children?: React.ReactNode;
}

export const TaskCreateButton = ({
    className = 'honor-button-primary flex items-center',
    iconSize = 18,
    children,
}: TaskCreateButtonProps) => {
    const { user } = useAuth();
    const { navigateToTaskCreate } = useTaskCreationGuard();

    const handleCreatTask = () => {
        navigateToTaskCreate(user);
    };

    return (
        <>
            <Button
                className={className}
                onClick={handleCreatTask}>
                <Plus
                    size={iconSize}
                    className="mr-2"
                />
                {children || 'Создать задание'}
            </Button>
        </>
    );
};
