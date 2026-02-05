import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const TasksTab = () => {
    const accessToken = useAuthStore((state) => state.accessToken);

    const [escalatingTask, setEscalatingTask] = useState<{
        id: number;
        title: string;
    } | null>(null);

    const needsEscalation = (days: number) => days > 7;

    const {
        data: tasks,
        loading,
        error,
    } = useAuthorizedFetch<Task[]>('/api/v1/tasks/user-tasks', accessToken);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-center py-10 text-red-500">{error}</p>;
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
                <Link to={`/tasks/${task.id}`}>
                    <Card
                        key={task.id}
                        className="honor-card mb-4 hover:shadow-lg">
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
                    <Link to="/tasks/create">
                        <Button className="honor-button-primary">
                            Создать первое задание
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TasksTab;
