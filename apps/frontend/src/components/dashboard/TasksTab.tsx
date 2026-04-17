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
    BookType,
    User,
    RefreshCw,
} from 'lucide-react';
import EscalateTask from './EscalateTask';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Task } from '@monorepo/types';
import Layout from '@/components/layout/Layout';
import Loader from '@/components/ui/loader';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '../ui/task-status-badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import TaskCard from '../task/TaskCard';
import { useShowMore } from '@/hooks/useShowMore';
import { TaskCreateButton } from '../ui/taskCreateButton';

const TasksTab = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [escalatingTask, setEscalatingTask] = useState<{
        id: number;
        title: string;
    } | null>(null);

    const needsEscalation = (days: number) => days > 7;

    const { displayedItems, shouldShowButton, showAll, remainingCount, handleShowAll, handleCollapse } = useShowMore(
        tasks,
        { defaultItemsCount: 5 },
    );

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

    useEffect(() => {
        fetchGetTasksRepresentative();
    }, []);

    const handleRefresh = () => {
        fetchGetTasksRepresentative();
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
                <div className="flex gap-2">
                    {tasks.length > 0 && (
                        <Button
                            className="honor-button-primary flex items-center"
                            onClick={handleRefresh}
                            disabled={loading}>
                            <RefreshCw size={18} />
                        </Button>
                    )}
                    <TaskCreateButton />
                </div>
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

            <div className="max-w-5xl mx-auto">
                <div className="max-w-5xl mx-auto">
                    {tasks.length === 0 ? (
                        <div className="text-center py-10">
                            <BookType
                                className="mx-auto mb-4 text-honor-darkGray/90"
                                size={64}
                            />
                            <p className="text-honor-darkGray mb-4">У вас пока нет отправленных заданий</p>
                        </div>
                    ) : (
                        <>
                            {displayedItems.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    isEdit={false}
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
        </div>
    );
};

export default TasksTab;
