import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, AlertTriangle, BookType, User } from 'lucide-react';
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
import TaskCard from '../task/TaskCard';

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
        const hasSubscriptions = user.subscriptions && user.subscriptions.length > 0;

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

                <Button
                    className="honor-button-primary flex items-center"
                    onClick={handleCreateTaskClick}>
                    <Plus
                        size={18}
                        className="mr-2"
                    />
                    Создать задание
                </Button>
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
                <TaskCard
                    key={task.id}
                    task={task}
                />
            ))}

            {tasks.length === 0 && (
                <div className="text-center py-10">
                    <BookType
                        className="mx-auto mb-4 text-honor-darkGray/90"
                        size={64}
                    />
                    <p className="text-honor-darkGray mb-4">У вас пока нет отправленных заданий</p>
                </div>
            )}
        </div>
    );
};

export default TasksTab;
