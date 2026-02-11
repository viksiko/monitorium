import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    MapPin,
    Calendar,
    Clock,
    Plus,
    ThumbsUp,
    MessageSquare,
    AlertTriangle,
} from 'lucide-react';
import EscalateTask from './EscalateTask';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Task } from '@monorepo/types';
import Layout from '@/components/layout/Layout';
import Loader from '@/components/ui/loader';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '../ui/task-status-badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const TasksTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [escalatingTask, setEscalatingTask] = useState<{
        id: number;
        title: string;
    } | null>(null);

    const needsEscalation = (days: number) => days > 7;

    useEffect(() => {
        const fetchGetTasksRepresentative = async () => {
            try {
                const response = await api.get('/api/v1/tasks/user-tasks');

                setTasks(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки заданий избирателя:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGetTasksRepresentative();
    }, []);

    const handleCreateTaskClick = (e: React.MouseEvent) => {
        // Проверяем наличие подписок
        const hasSubscriptions =
            user.subscriptions && user.subscriptions.length > 0;

        if (!user?.isRepresentative && !hasSubscriptions) {
            // e.preventDefault(); // Останавливаем переход, если это ссылка

            toast({
                title: 'Ошибка создания',
                description:
                    'У вас нет активных подписок на представителей. Пожалуйста, подпишитесь, чтобы создавать задания.',
                variant: 'destructive',
            });
            return;
        }

        // Если все ок — отправляем на страницу создания
        navigate('/tasks/create');
    };

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Мои задания</h2>
                {tasks.length !== 0 && (
                    <Link to="/tasks/create">
                        <Button className="honor-button-primary flex items-center">
                            <Plus
                                size={18}
                                className="mr-2"
                            />
                            Создать задание
                        </Button>
                    </Link>
                )}
            </div>

            <Dialog
                open={!!escalatingTask}
                onOpenChange={(open) => !open && setEscalatingTask(null)}>
                <DialogContent className="sm:max-w-lg">
                    <EscalateTask
                        taskId={escalatingTask?.id.toString()}
                        taskTitle={escalatingTask?.title}
                        onCancel={() => setEscalatingTask(null)}
                    />
                </DialogContent>
            </Dialog>

            {tasks.map((task) => (
                <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}>
                    <Card className="honor-card mb-4 hover:shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">{task.title}</h3>
                            <TaskStatusBadge status={task.status} />
                        </div>

                        <div className="flex items-center text-honor-darkGray text-sm mb-4">
                            <MapPin
                                size={16}
                                className="mr-1"
                            />
                            <span>{task.address}</span>
                            <span className="mx-2">•</span>
                            <Calendar
                                size={16}
                                className="mr-1"
                            />
                            <span>
                                До{' '}
                                {new Date(
                                    task.desiredResolutionDate,
                                ).toLocaleDateString('ru-RU')}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                    <ThumbsUp size={18} />
                                    <span>{task.likesCount}</span>
                                </div>
                                {/* <div className="flex items-center space-x-1 text-honor-darkGray">
                                <MessageSquare size={18} />
                                <span>{task.comments}</span>
                            </div> */}
                            </div>
                            <div className="flex items-center">
                                {/* {task.status !== 'NEW' &&
                                    needsEscalation(task.lastResponseDays) && (
                                        <Button
                                            variant="ghost"
                                            className="text-amber-600 flex items-center mr-2 hover:bg-amber-50"
                                            onClick={() =>
                                                setEscalatingTask({
                                                    id: task.id,
                                                    title: task.title,
                                                })
                                            }>
                                            <AlertTriangle
                                                size={16}
                                                className="mr-1"
                                            />
                                            Эскалировать
                                        </Button>
                                    )} */}
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-honor-darkGray">
                                        <Clock
                                            size={16}
                                            className="inline mr-1"
                                        />
                                        Создано{' '}
                                        {new Date(
                                            task.createdAt,
                                        ).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}

            {tasks.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-honor-darkGray mb-4">
                        У вас пока нет заданий
                    </p>

                    <Button
                        className="honor-button-primary"
                        onClick={handleCreateTaskClick}>
                        Создать первое задание
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TasksTab;
