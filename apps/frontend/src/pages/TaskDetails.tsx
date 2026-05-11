import { UserProfileSidebar } from '@/components/dashboard';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Task } from '@monorepo/types';
import {
    Calendar,
    Check,
    CircleChevronLeft,
    Clock,
    Eye,
    MapPin,
    MessageSquare,
    ThumbsUp,
    User,
    UserStar,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';
import DashboardBackButton from '@/components/ui/dashboardBackButton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskCommentsSection } from '@/components/comment/TaskCommentsSection';

const TaskDetails = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const { taskId } = useParams<{ taskId: string }>();
    const { data: task, loading, error } = useAuthorizedFetch<Task>(`/api/v1/tasks/${taskId}`, accessToken);
    const [commentsVisible, setDisplayComments] = useState(true);

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
                <h1 className="text-3xl font-bold  text-honor-darkGray mb-8">Задача «{task.title}»</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <UserProfileSidebar />
                    </div>
                    <div className="relative lg:col-span-2">
                        <DashboardBackButton />
                        <div>
                            <Tabs defaultValue="tasks">
                                <TabsContent
                                    value="tasks"
                                    className="space-y-6 mt-0">
                                    <Card
                                        key={task.id}
                                        className="honor-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{task.title}</h2>
                                            <div className="flex items-center">
                                                <TaskStatusBadge status={task.status} />
                                            </div>
                                        </div>
                                        <div className="flex items-center text-honor-darkGray text-sm mb-4">
                                            <div className="flex items-center">
                                                <UserStar
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                <span>{task.assignee.name}</span>
                                            </div>
                                            <span className="mx-2">•</span>
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
                                            <span>
                                                До {new Date(task.desiredResolutionDate).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-honor-darkGray mb-4 font-medium">
                                                {task.problemDescription}
                                            </p>
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
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className={`flex items-center group ${!commentsVisible ? 'bg-slate-100' : 'bg-white'} hover:bg-slate-100`}
                                                    onClick={() => setDisplayComments(!commentsVisible)}>
                                                    <MessageSquare
                                                        size={18}
                                                        className="text-honor-darkGray group-hover:text-honor-blue"
                                                    />
                                                </Button>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <Eye size={18} />
                                                    <span>{task.viewsCount}</span>
                                                </div>
                                            </div>
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
                                        {commentsVisible && (
                                            <TaskCommentsSection
                                                key={task.id}
                                                taskId={task.id}
                                                className="mt-4"
                                            />
                                        )}
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
