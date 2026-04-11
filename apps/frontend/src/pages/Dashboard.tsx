import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileSidebar, TasksTab, NotificationsTab, SubscriptionsTab } from '@/components/dashboard';
import { useAuth } from '@/context/AuthContext';
import { MessagesTab } from '@/components/representative';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!isLoading && !user) {
    //         navigate('/login');
    //     }
    // }, [user, isLoading, navigate]);

    useEffect(() => {
        // Если пользователь - представитель власти, перенаправляем на специальный дашборд
        if (user && user.isRepresentative) {
            navigate('/representative/dashboard');
        }
    }, [user, navigate]);

    // if (isLoading) {
    //     return (
    //         <Layout>
    //             <div className="honor-container py-12">
    //                 <div className="flex justify-center items-center min-h-[400px]">
    //                     <div className="text-center">
    //                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-honor-blue mx-auto mb-4"></div>
    //                         <p className="text-honor-darkGray">Загрузка...</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </Layout>
    //     );
    // }

    if (!user || user.isRepresentative) {
        return null; // Будет редирект
    }

    console.log('Dashboard - User:', user);

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-honor-darkGray">Добро пожаловать, {user.name}!</h1>
                    <p className="text-honor-darkGray mt-2">
                        Управляйте своими заданиями и следите за активностью в вашем округе
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User profile sidebar */}
                    <div className="lg:col-span-1">
                        <UserProfileSidebar />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="tasks">
                            <TabsList className="mb-6 bg-honor-gray">
                                <TabsTrigger
                                    value="tasks"
                                    className="flex-1">
                                    Мои задания
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="flex-1">
                                    Сообщения
                                </TabsTrigger>
                                {/* <TabsTrigger
                                    value="notifications"
                                    className="flex-1">
                                    Уведомления
                                </TabsTrigger> */}
                                <TabsTrigger
                                    value="subscriptions"
                                    className="flex-1">
                                    Подписки
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tasks">
                                <TasksTab />
                            </TabsContent>

                            <TabsContent value="messages">
                                <MessagesTab />
                            </TabsContent>

                            <TabsContent value="notifications">
                                <NotificationsTab />
                            </TabsContent>

                            <TabsContent value="subscriptions">
                                <SubscriptionsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
