import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { generateUserReportPDF } from '@/utils/generateUserReportPDF';
import { useAuth } from '@/context/AuthContext';
import { useGetUserStatistics } from '@/lib/query/user.query';
import { TasksSummary } from '@/types/Interfaces';
import Loader from '@/components/ui/loader';
import DataLoadingError from '@/components/ui/dataLoadingError';
import { useUserStatistics } from '@/hooks/useUserStatistics';

const RepresentativeStatistics = () => {
    const { user } = useAuth();
    const { data, isLoading, isPending, isError } = useGetUserStatistics();
    const { selectedYear, setSelectedYear, years, filteredData, summaryByYears } = useUserStatistics(data);

    if (isError) {
        return (
            <Layout>
                <DataLoadingError message="Не удалось загрузить статистику пользователя." />
            </Layout>
        );
    }

    if (isLoading || isPending) {
        return (
            <>
                <Layout>
                    <Loader />
                </Layout>
            </>
        );
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold">Статистика и отчеты</h1>

                        <select
                            value={selectedYear ?? ''}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border rounded-md px-3 py-1 text-sm hover:cursor-pointer">
                            {years.map((year) => (
                                <option
                                    key={year}
                                    value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6 mb-8">
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Всего задач</h3>
                            <p className="text-4xl font-bold text-honor-blue">
                                {summaryByYears[selectedYear]?.created || 0}
                            </p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Выполнено</h3>
                            <p className="text-4xl font-bold text-green-500">
                                {summaryByYears[selectedYear]?.completed || 0}
                            </p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Запланировано</h3>
                            <p className="text-4xl font-bold text-orange-500">
                                {summaryByYears[selectedYear]?.planned || 0}
                            </p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">В процессе</h3>
                            <p className="text-4xl font-bold text-blue-500">
                                {summaryByYears[selectedYear]?.inprogress || 0}
                            </p>
                        </Card>
                        <Card className="p-6 text-center">
                            <h3 className="text-honor-darkGray mb-2">Отклонено</h3>
                            <p className="text-4xl font-bold text-red-500">
                                {summaryByYears[selectedYear]?.rejected || 0}
                            </p>
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
                                <h2 className="text-xl font-bold mb-2">Динамика задач по месяцам</h2>
                                <div className="h-80">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%">
                                        <BarChart
                                            data={filteredData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="created"
                                                name="Создано"
                                                fill="#3b82f6"
                                            />
                                            <Bar
                                                dataKey="completed"
                                                name="Выполнено"
                                                fill="#10b981"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="engagement">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-2">Активность избирателей по месяцам</h2>
                                <div className="h-80">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%">
                                        <BarChart
                                            data={data}
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
                                                dataKey="likes"
                                                name="Лайки"
                                                fill="#8884d8"
                                            />
                                            <Bar
                                                dataKey="comments"
                                                name="Комментарии"
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
                                    {years.map((year) => (
                                        <li
                                            key={year}
                                            className="p-3 bg-honor-gray rounded-lg hover:bg-honor-gray/80">
                                            <div className="flex justify-between items-center">
                                                <span>Годовой отчет за {year} год</span>
                                                <span
                                                    onClick={() => {
                                                        const yearData = data.filter((item) => item.year === year);
                                                        const summary = summaryByYears[year];

                                                        generateUserReportPDF(yearData, summary, user.name);
                                                    }}
                                                    className="text-honor-blue hover:cursor-pointer">
                                                    Скачать PDF
                                                </span>
                                            </div>
                                        </li>
                                    ))}
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
