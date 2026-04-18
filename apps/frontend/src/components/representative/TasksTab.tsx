import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, BookType, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loader from '../ui/loader';
import { TaskStatusBadge } from '../ui/task-status-badge';
import { Task } from '@monorepo/types';
import { useShowMore } from '@/hooks/useShowMore';
import TaskCard from '../task/TaskCard';
import ItemCount from '../ui/itemCount';

const TasksTab = () => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchGetTasksRepresentative = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/v1/tasks/user-tasks');
            setTasks(response.data.data);
        } catch (error) {
            console.error('Ошибка загрузки задач представителя:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const { displayedItems, shouldShowButton, showAll, remainingCount, handleShowAll, handleCollapse } = useShowMore(
        tasks,
        { defaultItemsCount: 5 },
    );

    useEffect(() => {
        fetchGetTasksRepresentative();
    }, []);

    const handleRefresh = () => {
        fetchGetTasksRepresentative();
    };

    // const handleUpdateTaskStatus = (taskId: number) => {
    //     toast.success('Статус обновлен', {
    //         description: 'Статус задачи успешно обновлен',
    //     });
    // };

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                    <h2 className="text-2xl font-bold">Мои задачи</h2>
                    <ItemCount count={tasks.length} />
                </div>
                {/* <Link to="/tasks/create">
                    <Button className="honor-button-primary flex items-center">
                        <Plus
                            size={18}
                            className="mr-2"
                        />
                        Создать задачу
                    </Button>
                </Link> */}
                <Button
                    className="honor-button-primary flex items-center"
                    onClick={handleRefresh}
                    disabled={loading}>
                    <RefreshCw
                        size={18}
                        className="mr-2"
                    />
                    Обновить список
                </Button>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="max-w-5xl mx-auto">
                    {tasks.length === 0 ? (
                        <div className="text-center py-10">
                            <BookType
                                className="mx-auto mb-4 text-honor-darkGray/90"
                                size={64}
                            />
                            <p className="text-honor-darkGray mb-4">У вас пока нет присланных задач</p>
                        </div>
                    ) : (
                        <>
                            {displayedItems.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    isEdit={true}
                                />
                            ))}

                            {shouldShowButton && !showAll && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleShowAll}
                                        className="px-6 py-2 text-sm font-medium text-honor-blue border border-honor-blue rounded-lg hover:bg-honor-blue hover:text-white transition-colors">
                                        Показать все ({remainingCount} осталось)
                                    </button>
                                </div>
                            )}

                            {showAll && shouldShowButton && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleCollapse}
                                        className="px-6 py-2 text-sm font-medium text-honor-darkGray border border-honor-darkGray rounded-lg hover:bg-honor-darkGray hover:text-white transition-colors">
                                        Свернуть
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default TasksTab;
