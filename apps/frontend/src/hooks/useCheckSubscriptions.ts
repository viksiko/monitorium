import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { User } from '@monorepo/types';

export const useTaskCreationGuard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const checkSubscriptionsForTaskCreation = (user: User): boolean => {
        const hasSubscriptions = user?.subscriptions && user.subscriptions.length > 0;

        if (!user?.isRepresentative && !hasSubscriptions) {
            toast({
                title: 'Ошибка создания',
                description:
                    'У вас нет активных подписок на представителей. Пожалуйста, подпишитесь, чтобы создавать задания.',
                variant: 'destructive',
            });
            return false;
        }

        return true;
    };

    const navigateToTaskCreate = (user: User) => {
        if (checkSubscriptionsForTaskCreation(user)) {
            navigate('/tasks/create');
        }
    };

    return { checkSubscriptionsForTaskCreation, navigateToTaskCreate };
};
