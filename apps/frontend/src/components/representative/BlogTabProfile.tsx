import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Clock, Plus, ThumbsUp, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import Loader from '../ui/loader';
import { Post } from '@monorepo/types';
import { Button } from '../ui/button';

const BlogTabProfile = ({ userId }: { userId: string }) => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchGetTasksRepresentative = async () => {
            try {
                const response = await api.get(`/api/v1/posts/user/${userId}`);

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

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="honor-card text-center py-8">
                <p className="text-honor-darkGray">Публикации отсутсвуют</p>
            </div>
        );
    }

    return (
        <>
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
        </>
    );
};

export default BlogTabProfile;
