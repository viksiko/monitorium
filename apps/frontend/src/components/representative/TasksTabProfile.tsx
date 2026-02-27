import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { MapPin, Calendar, Clock, ThumbsUp } from 'lucide-react';
import { Task } from '@monorepo/types';
import Loader from '@/components/ui/loader';
import { TaskStatusBadge } from '../ui/task-status-badge';

import { api } from '@/lib/api';

const TasksTabProfile = ({ userId }: { userId: string }) => {
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
                const response = await api.get(`/api/v1/tasks/user/${userId}`);

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

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="honor-card text-center py-8">
                <p className="text-honor-darkGray">Задачи отсутствуют</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                            <span>До {new Date(task.desiredResolutionDate).toLocaleDateString('ru-RU')}</span>
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
                                        Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default TasksTabProfile;
