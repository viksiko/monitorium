import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

// Моковые данные для статистики
// const taskStatistics = [
//     { name: 'Янв', выполнено: 4, создано: 6 },
//     { name: 'Фев', выполнено: 3, создано: 4 },
//     { name: 'Мар', выполнено: 5, создано: 7 },
//     { name: 'Апр', выполнено: 7, создано: 8 },
//     { name: 'Май', выполнено: 6, создано: 10 },
//     { name: 'Июн', выполнено: 8, создано: 9 },
// ];

const engagementStatistics = [
    { name: 'Янв', лайки: 24, комментарии: 12 },
    { name: 'Фев', лайки: 18, комментарии: 9 },
    { name: 'Мар', лайки: 30, комментарии: 20 },
    { name: 'Апр', лайки: 38, комментарии: 25 },
    { name: 'Май', лайки: 40, комментарии: 30 },
    { name: 'Июн', лайки: 50, комментарии: 35 },
];

const RepresentativeStatistics = () => {
    const [userStats, setUserStats] = useState([]);
    const { loading, error, request } = useApi<any>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await request({
                    method: 'GET',
                    url: '/api/v1/users/statistics',
                });

                if (response) {
                    setUserStats(response);
                }
            } catch (err) {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось загрузить округа',
                    variant: 'destructive',
                });
            }
        };

        fetchData();
    }, []);

    console.log('userStats', userStats);

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Статистика и отчеты</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Всего задач</h3>
                            <p className="text-4xl font-bold text-honor-blue">42</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Выполнено</h3>
                            <p className="text-4xl font-bold text-green-600">28</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">В процессе</h3>
                            <p className="text-4xl font-bold text-amber-500">14</p>
                        </Card>
                    </div>

                    <Tabs defaultValue="tasks">
                        <TabsList className="mb-6 bg-honor-gray">
                            <TabsTrigger
                                value="tasks"
                                className="flex-1">
                                Статистика задач
                            </TabsTrigger>
                            <TabsTrigger
                                value="engagement"
                                className="flex-1">
                                Взаимодействие
                            </TabsTrigger>
                            <TabsTrigger
                                value="reports"
                                className="flex-1">
                                Отчеты
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Динамика задач по месяцам</h2>
                                <div className="h-80">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%">
                                        <BarChart
                                            data={userStats}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="создано"
                                                fill="#3b82f6"
                                            />
                                            <Bar
                                                dataKey="выполнено"
                                                fill="#10b981"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="engagement">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Активность избирателей</h2>
                                <div className="h-80">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%">
                                        <BarChart
                                            data={engagementStatistics}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="лайки"
                                                fill="#8884d8"
                                            />
                                            <Bar
                                                dataKey="комментарии"
                                                fill="#82ca9d"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Отчеты о деятельности</h2>
                                <p className="text-honor-darkGray mb-4">Доступные отчеты:</p>
                                <ul className="space-y-2">
                                    <li className="p-3 bg-honor-gray rounded-lg hover:bg-honor-gray/80 cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span>Ежемесячный отчет за май 2025</span>
                                            <span className="text-honor-blue">Скачать PDF</span>
                                        </div>
                                    </li>
                                    <li className="p-3 bg-honor-gray rounded-lg hover:bg-honor-gray/80 cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span>Ежемесячный отчет за апрель 2025</span>
                                            <span className="text-honor-blue">Скачать PDF</span>
                                        </div>
                                    </li>
                                    <li className="p-3 bg-honor-gray rounded-lg hover:bg-honor-gray/80 cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span>Квартальный отчет (Янв-Мар 2025)</span>
                                            <span className="text-honor-blue">Скачать PDF</span>
                                        </div>
                                    </li>
                                </ul>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeStatistics;
