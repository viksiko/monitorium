import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSidebar, TasksTab, MessagesTab } from '@/components/representative';
import BlogTab from '@/components/representative/BlogTab';
import { useAuth } from '@/context/AuthContext';
import SubscribersTab from '@/components/representative/SubscribersTab';

const RepresentativeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.isRepresentative) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

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
                                <TabsTrigger
                                    value="subscribers"
                                    className="flex-1">
                                    Подписчики
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

                            <TabsContent value="subscribers">
                                <SubscribersTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeDashboard;
