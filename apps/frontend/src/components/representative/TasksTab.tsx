import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, BookType, User } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loader from '../ui/loader';
import { TaskStatusBadge } from '../ui/task-status-badge';
import { Task } from '@monorepo/types';

const TasksTab = () => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchGetTasksRepresentative = async () => {
            try {
                const response = await api.get('/api/v1/tasks/user-tasks');

                setTasks(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки задач представителя:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGetTasksRepresentative();
    }, []);

    const handleUpdateTaskStatus = (taskId: number) => {
        toast.success('Статус обновлен', {
            description: 'Статус задачи успешно обновлен',
        });
    };

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-10">
                <BookType
                    className="mx-auto mb-4 text-honor-darkGray/90"
                    size={64}
                />
                <p className="text-honor-darkGray mb-4">У вас пока нет присланных заданий</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Мои задачи</h2>
                {/* <Link to="/tasks/create">
                    <Button className="honor-button-primary flex items-center">
                        <Plus
                            size={18}
                            className="mr-2"
                        />
                        Создать задачу
                    </Button>
                </Link> */}
            </div>

            {tasks.map((task) => (
                <Link
                    key={task.id}
                    to={`/tasks/${task.id}/edit`}>
                    <Card className="honor-card mb-4 hover:shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start">
                                <h3 className="text-xl font-bold">{task.title}</h3>
                                {/* {task.hasEscalation && <Badge className="ml-2 bg-red-100 text-red-800">Эскалация</Badge>} */}
                            </div>
                            <TaskStatusBadge status={task.status} />
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex items-center text-honor-darkGray text-sm mb-4">
                                <div className="flex items-center">
                                    <User
                                        size={16}
                                        className="mr-1"
                                    />
                                    <span>{task.author.name}</span>
                                </div>
                                <span className="mx-2">•</span>
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

                            <Button
                                variant="link"
                                className="p-0 h-auto text-honor-blue">
                                Подробнее
                            </Button>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                    <ThumbsUp size={18} />
                                    {/* <span>{task.likes}</span> */}
                                </div>
                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                    <MessageSquare size={18} />
                                    <span>{task.comments}</span>
                                </div>
                            </div>
                            <span className="text-sm text-honor-darkGray">
                                <Clock
                                    size={16}
                                    className="inline mr-1"
                                />
                                Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                            {/* <Button
                            className={`flex-1 ${task.hasEscalation ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
                            onClick={() => handleUpdateTaskStatus(task.id)}>
                            {task.hasEscalation
                                ? 'Ответить на эскалацию'
                                : 'Обновить статус'}
                        </Button> 
                        <Link to={`/tasks/${task.id}/edit`}>
                            <Button className=" honor-button-secondary">Редактировать</Button>
                        </Link>*/}
                        </div>
                    </Card>
                </Link>
            ))}

            {tasks.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-honor-darkGray mb-4">У вас пока нет задач</p>
                    <Link to="/tasks/create">
                        <Button className="honor-button-primary">Создать первую задачу</Button>
                    </Link>
                </div>
            )}
        </>
    );
};

export default TasksTab;
