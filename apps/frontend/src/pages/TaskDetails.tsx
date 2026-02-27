import { UserProfileSidebar } from '@/components/dashboard';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Task } from '@monorepo/types';
import { Calendar, Check, CircleChevronLeft, Clock, Eye, MapPin, MessageSquare, ThumbsUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';

const TaskDetails = () => {
    // const [showModifications, setShowModifications] = useState<number | null>(
    //     null,
    // );

    // const getStatusColor = (status: string) => {
    //     switch (status) {
    //         case 'completed':
    //             return 'bg-green-100 text-green-800';
    //         case 'in-progress':
    //             return 'bg-blue-100 text-blue-800';
    //         case 'planned':
    //             return 'bg-orange-100 text-orange-800';
    //         default:
    //             return 'bg-gray-100 text-gray-800';
    //     }
    // };

    // const getStatusText = (status: string) => {
    //     switch (status) {
    //         case 'completed':
    //             return 'Выполнено';
    //         case 'in-progress':
    //             return 'В процессе';
    //         case 'planned':
    //             return 'Запланировано';
    //         default:
    //             return 'Неизвестно';
    //     }
    // };

    const accessToken = useAuthStore((state) => state.accessToken);
    const { taskId } = useParams<{ taskId: string }>();
    const { data: task, loading, error } = useAuthorizedFetch<Task>(`/api/v1/tasks/${taskId}`, accessToken);

    if (loading) {
        return (
            <Layout>
                <Loader />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <p className="text-red-500">{error}</p>
                </div>
            </Layout>
        );
    }

    if (!task) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <p>Задача не найдена</p>
                    <Link to="/tasks">← Вернуться к списку</Link>
                </div>
            </Layout>
        );
    }

    function handleLike(arg0: string, id: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <UserProfileSidebar />
                    </div>
                    <div className="lg:col-span-2">
                        <Link
                            to="/dashboard"
                            className="block w-4 hover:opacity-80">
                            <CircleChevronLeft
                                size={40}
                                strokeWidth={1.75}
                                className="text-honor-blue"
                            />
                        </Link>
                        <div>
                            <Tabs defaultValue="tasks">
                                <TabsContent
                                    value="tasks"
                                    className="space-y-6">
                                    <Card
                                        key={task.id}
                                        className="honor-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{task.title}</h2>
                                            <div className="flex items-center">
                                                <TaskStatusBadge status={task.status} />
                                            </div>
                                        </div>

                                        {/* {showModifications === task.id &&
                                            task.modificationHistory.length >
                                                0 && (
                                                <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                                    <h3 className="font-semibold mb-2">
                                                        История изменений:
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {task.modificationHistory.map(
                                                            (mod, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="text-honor-darkGray">
                                                                    <span className="font-medium">
                                                                        {new Date(
                                                                            mod.date,
                                                                        ).toLocaleDateString(
                                                                            'ru-RU',
                                                                        )}
                                                                    </span>{' '}
                                                                    - Поле "
                                                                    <span className="italic">
                                                                        {
                                                                            mod.field
                                                                        }
                                                                    </span>
                                                                    " изменено с
                                                                    "
                                                                    <span className="line-through">
                                                                        {
                                                                            mod.oldValue
                                                                        }
                                                                    </span>
                                                                    " на "
                                                                    <span className="font-medium">
                                                                        {
                                                                            mod.newValue
                                                                        }
                                                                    </span>
                                                                    "
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )} */}

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
                                                До {new Date(task.desiredResolutionDate).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-honor-darkGray mb-2">{task.problemDescription}</p>
                                            <p className="text-sm font-medium">Решение: {task.possibleSolutions}</p>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold mb-2">Этапы выполнения</h3>
                                            <div className="space-y-2">
                                                {task.stages.map((stage) => (
                                                    <div
                                                        key={stage.id}
                                                        className="flex items-center">
                                                        <div
                                                            className={`h-4 w-4 flex items-center justify-center rounded-full mr-3 cursor-pointer transition-all ${
                                                                stage.isCompleted
                                                                    ? 'bg-honor-blue'
                                                                    : 'border border-honor-darkGray'
                                                            }`}>
                                                            {stage.isCompleted && (
                                                                <Check
                                                                    size={10}
                                                                    className="text-white"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p
                                                                    className={`${stage.isCompleted ? 'font-medium' : 'text-honor-darkGray'}`}>
                                                                    {stage.title}
                                                                </p>
                                                                <p className="text-xs text-honor-darkGray">
                                                                    {new Date(stage.date).toLocaleDateString('ru-RU')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t">
                                            <div className="flex space-x-4">
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <ThumbsUp size={18} />
                                                    <span>{task.likesCount}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <MessageSquare size={18} />
                                                    <span>{task.comments}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <Eye size={18} />
                                                    <span>{task.viewsCount}</span>
                                                </div>
                                            </div>
                                            {/* <span className="text-sm text-honor-darkGray">
                                                <Clock
                                                    size={16}
                                                    className="inline mr-1"
                                                />
                                                Обновлено 2 дня назад
                                            </span> */}
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
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TaskDetails;
