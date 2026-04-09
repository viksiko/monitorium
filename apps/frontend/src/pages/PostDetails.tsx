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
import { useGetPostById } from '@/lib/query/post.query';
import { Author, AuthorRoleIcon } from '@/components/common/Author';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PostCommentsSection } from '@/components/comment/PostCommentsSection';

const PostDetails = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const { postId } = useParams<{ postId: string }>();
    const { data: post, isLoading, isPending, error } = useGetPostById(postId);

    const [commentsVisible, setDisplayComments] = useState(false);

    if (isLoading || isPending) {
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
                    <p className="text-red-500">{error.message}</p>
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
                    <div className="relative lg:col-span-1">{/* <RepresantiveProfileSidebar /> */}</div>
                    <div className="relative lg:col-span-2 ">
                        <DashboardBackButton />
                        <div>
                            <Tabs defaultValue="posts">
                                <TabsContent
                                    value="posts"
                                    className="space-y-6 mt-0">
                                    <Card className="honor-card">
                                        <div className="flex items-center mb-4">
                                            <Author size="large">
                                                <Author.Name name={post.author.name}>
                                                    <AuthorRoleIcon role={'REPRESENTATIVE'} />
                                                </Author.Name>
                                                <p className="text-xs text-honor-darkGray">
                                                    {post.author.representativeProfile.position}
                                                </p>
                                            </Author>

                                            <div className="ml-auto text-sm flex items-center text-honor-darkGray">
                                                <Calendar
                                                    size={14}
                                                    className="inline mr-1"
                                                />
                                                {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

                                        <p className="max-w-none mb-6">{post.content}</p>

                                        <div className="flex space-x-4 items-center pt-4 border-t">
                                            <Button
                                                className="flex items-center group bg-white hover:bg-slate-100"
                                                onClick={handleLike}>
                                                <ThumbsUp
                                                    size={20}
                                                    className="text-honor-darkGray group-hover:text-honor-blue"
                                                />
                                                <span className="text-honor-darkGray group-hover:text-honor-blue">
                                                    {post.likesCount}
                                                </span>
                                            </Button>
                                            <Button
                                                className={`flex items-center group ${commentsVisible ? 'bg-slate-100' : 'bg-white'} hover:bg-slate-100`}
                                                onClick={() => setDisplayComments(!commentsVisible)}>
                                                <MessageSquare
                                                    size={20}
                                                    className="text-honor-darkGray group-hover:text-honor-blue"
                                                />
                                            </Button>
                                        </div>
                                        {commentsVisible && (
                                            <PostCommentsSection
                                                key={post.id}
                                                postId={post.id}
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

export default PostDetails;
