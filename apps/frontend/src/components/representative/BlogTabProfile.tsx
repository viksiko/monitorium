import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Clock, Plus, ThumbsUp, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import Loader from '../ui/loader';
import { Post } from '@monorepo/types';
import { Button } from '../ui/button';
import PostCard from '../post/PostCard';

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
                <PostCard
                    key={post.id}
                    post={post}
                />
            ))}
        </>
    );
};

export default BlogTabProfile;
