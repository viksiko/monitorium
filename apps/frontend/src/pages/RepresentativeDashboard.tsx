import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSidebar, TasksTab, MessagesTab } from '@/components/representative';
import BlogTab from '@/components/representative/BlogTab';
import { useAuth } from '@/context/AuthContext';

const RepresentativeDashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && (!user || !user.isRepresentative)) {
            navigate('/dashboard');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-honor-blue mx-auto mb-4"></div>
                            <p className="text-honor-darkGray">Загрузка...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user || !user.isRepresentative) {
        return null; // Будет редирект
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-honor-darkGray">Панель представителя власти</h1>
                    <p className="text-honor-darkGray mt-2">
                        Добро пожаловать, {user.name}! Управляйте задачами и взаимодействуйте с избирателями
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile sidebar */}
                    <div className="lg:col-span-1">
                        <ProfileSidebar />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="tasks">
                            <TabsList className="mb-6 bg-honor-gray">
                                <TabsTrigger
                                    value="tasks"
                                    className="flex-1">
                                    Задачи
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="flex-1">
                                    Сообщения
                                </TabsTrigger>
                                <TabsTrigger
                                    value="blog"
                                    className="flex-1">
                                    Блог
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tasks">
                                <TasksTab />
                            </TabsContent>

                            <TabsContent value="messages">
                                <MessagesTab />
                            </TabsContent>

                            <TabsContent value="blog">
                                <BlogTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeDashboard;
