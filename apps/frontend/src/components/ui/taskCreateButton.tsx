import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTaskCreationGuard } from '@/hooks/useCheckSubscriptions';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    const handleCreatTask = () => {
        navigate('/tasks/create');
        // navigateToTaskCreate(user); // Временно отключаем проверку подписок для создания заданий
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
