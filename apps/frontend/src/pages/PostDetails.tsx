import { UserProfileSidebar } from '@/components/dashboard';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Post } from '@monorepo/types';
import { Calendar, Check, CircleChevronLeft, Clock, Eye, MapPin, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';
import RepresantiveProfileSidebar from '@/components/representative/RepresantiveProfileSidebar';
import { Avatar } from '@/components/ui/avatar';
import DashboardBackButton from '@/components/ui/dashboardBackButton';

const PostDetails = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const { postId } = useParams<{ postId: string }>();
    const { data: post, loading, error } = useAuthorizedFetch<Post>(`/api/v1/posts/${postId}`, accessToken);

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

    if (!postId) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <p>Статья не найдена</p>
                    <Link to="/posts">← Вернуться к списку</Link>
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
                <h1 className="text-3xl font-bold  text-honor-darkGray mb-8">Статья «{post.title}»</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="relative lg:col-span-1">
                        <RepresantiveProfileSidebar />
                    </div>
                    <div className="relative lg:col-span-2 ">
                        <DashboardBackButton />
                        <div>
                            <Tabs defaultValue="posts">
                                <TabsContent
                                    value="posts"
                                    className="space-y-6 mt-0">
                                    <Card className="honor-card">
                                        <div className="flex items-center mb-4">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <User size={20} />
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{post.author.name}</p>
                                                <p className="text-xs text-honor-darkGray">
                                                    {post.author.representativeProfile.position}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-sm text-honor-darkGray">
                                                <Calendar
                                                    size={14}
                                                    className="inline mr-1"
                                                />
                                                {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

                                        {/* // !!! не безопасно */}
                                        <div
                                            className="prose max-w-none mb-6"
                                            dangerouslySetInnerHTML={{
                                                __html: post.content,
                                            }}
                                        />

                                        <div className="flex justify-between items-center pt-4 border-t">
                                            <div className="flex space-x-4">
                                                <button
                                                    className="flex items-center space-x-1 text-honor-darkGray hover:text-honor-blue"
                                                    onClick={handleLike}>
                                                    <ThumbsUp size={18} />
                                                    <span>{post.likesCount}</span>
                                                </button>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <MessageSquare size={18} />
                                                    {/* <span>{post.comments}</span> */}
                                                </div>
                                            </div>
                                            {/* <button
                                                    className="text-honor-darkGray hover:text-honor-blue"
                                                    onClick={handleShare}>
                                                    <Share2 size={18} />
                                                </button> */}
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

export default PostDetails;
