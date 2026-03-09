import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, FilePen } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Loader from '../ui/loader';
import { TaskStatusBadge } from '../ui/task-status-badge';
import { Post, Task } from '@monorepo/types';

const BlogTab = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchGetTasksRepresentative = async () => {
            try {
                const response = await api.get(`/api/v1/posts/user/${user.id}`);

                setPosts(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки задач представителя:', error);
                setPosts([]);
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

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Мои статьи</h2>
                <Link to="/posts/create">
                    <Button className="honor-button-primary flex items-center">
                        <Plus
                            size={18}
                            className="mr-2"
                        />
                        Создать статью
                    </Button>
                </Link>
            </div>

            {posts.map((post) => (
                <Link
                    key={post.id}
                    to={`/posts/${post.id}`}>
                    <Card className="honor-card mb-4 hover:shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start flex-col w-full">
                                <h3 className="text-xl font-bold mb-4">{post.title}</h3>
                                {/* {task.hasEscalation && <Badge className="ml-2 bg-red-100 text-red-800">Эскалация</Badge>} */}
                                <div className="flex justify-between items-center w-full">
                                    <div>
                                        {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
                                    </div>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-honor-blue">
                                        Подробнее
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                    <ThumbsUp size={18} />
                                    <span>{post.likesCount}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                    <MessageSquare size={18} />
                                    {/* <span>{post.comments.length}</span> */}
                                </div>
                            </div>
                            <span className="text-sm text-honor-darkGray">
                                <Clock
                                    size={16}
                                    className="inline mr-1"
                                />
                                Создано {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </Card>
                </Link>
            ))}

            {posts.length === 0 && (
                <div className="text-center py-10">
                    <FilePen
                        className="mx-auto mb-4 text-honor-darkGray/90"
                        size={64}
                    />
                    <p className="text-honor-darkGray mb-4">У вас пока нет опубликованных статей</p>
                </div>
            )}
        </>
    );
};

export default BlogTab;
