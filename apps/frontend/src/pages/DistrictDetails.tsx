import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Calendar,
    User,
    CheckCircle,
    AlertTriangle,
    Clock,
    BarChart,
    MessageSquare,
    ArrowLeft,
    Building2,
    ChevronLeft,
} from 'lucide-react';
import { Area, District, DistrictStats, Representative, Task } from '@monorepo/types';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';
import Loader from '@/components/ui/loader';

type CalculateStats = {
    tasksTotal: number;
    tasksCompleted: number;
    tasksInProgress: number;
};

const DistrictDetails = () => {
    const { id } = useParams();
    // const districtId = parseInt(id || '0');
    // const [tasks, setTasks] = useState<Task[]>([]);
    // const [representatives, setRepresentatives] = useState<Representative[]>([]);

    // const district = mockDistricts.find((d) => d.id === districtId);

    const [districtStats, setDistrictStats] = useState<DistrictStats | null>(null);
    const { loading, error, request } = useApi<DistrictStats>();

    useEffect(() => {
        request({ method: 'GET', url: `/api/v1/districts/${id}/stats` }).then(setDistrictStats);
    }, []);

    function calculateStats(tasks: { status: string }[] = []): CalculateStats {
        const tasksTotal = tasks.length;
        let tasksCompleted = 0;
        let tasksInProgress = 0;

        tasks.forEach((task) => {
            if (task.status === 'COMPLETED') {
                tasksCompleted++;
            } else {
                // всё остальное считаем "в процессе"
                tasksInProgress++;
            }
        });

        return {
            tasksTotal,
            tasksCompleted,
            tasksInProgress,
        };
    }

    const tastsStats = calculateStats(districtStats?.tasks);

    if (loading)
        return (
            <Layout>
                <Loader />
            </Layout>
        );

    if (error)
        return (
            <Layout>
                <div className="flex justify-center items-center">Ошибка загрузки данных</div>
            </Layout>
        );

    if (!districtStats) return null; // или skeleton / loader

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="mb-6">
                    <Link
                        to="/map"
                        className="inline-flex items-center text-honor-darkGray hover:text-honor-blue mb-4">
                        <Button className="p-2 h-auto text-sm mr-2">
                            <ChevronLeft size={24} />
                        </Button>
                        <span>Вернуться к карте</span>
                    </Link>

                    <div className="flex items-center mb-2">
                        <MapPin
                            className="text-honor-blue mr-2"
                            size={24}
                        />
                        <h1 className="text-3xl font-bold">{districtStats.name}</h1>
                    </div>

                    {districtStats.areas && (
                        <div className="mb-4">
                            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-honor-darkGray">
                                {districtStats.areas.map((area: Area) => (
                                    <li
                                        className="flex flex-row items-center gap-1"
                                        key={area.id}>
                                        <Building2 size={14} />
                                        {area.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <Tabs
                    defaultValue="overview"
                    className="mb-8">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="overview">Обзор</TabsTrigger>
                        <TabsTrigger value="representatives">Представители</TabsTrigger>
                        <TabsTrigger value="problems">Проблемы</TabsTrigger>
                        {/* <TabsTrigger value="events">События</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Общая информация</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">Всего задач</p>
                                                <p className="text-2xl font-bold text-honor-blue">
                                                    {tastsStats.tasksTotal}
                                                </p>
                                            </div>
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">Выполнено</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {tastsStats.tasksCompleted}
                                                </p>
                                            </div>
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">В процессе</p>
                                                <p className="text-2xl font-bold text-amber-600">
                                                    {tastsStats.tasksInProgress}
                                                </p>
                                            </div>
                                            {/* <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">Удовлетворенность</p>
                                                <p className="text-2xl font-bold text-honor-blue">
                                                    {district.stats.satisfactionRate}%
                                                </p>
                                            </div> */}
                                        </div>

                                        <div className="bg-honor-gray rounded-lg p-4">
                                            <div className="flex justify-between mb-2">
                                                <p className="text-sm font-medium">Прогресс выполнения задач</p>
                                                <p className="text-sm text-honor-darkGray">
                                                    {tastsStats.tasksTotal === 0
                                                        ? 0
                                                        : Math.round(
                                                              (tastsStats.tasksCompleted / tastsStats.tasksTotal) * 100,
                                                          )}
                                                    %
                                                </p>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-2.5">
                                                <div
                                                    className="bg-honor-blue h-2.5 rounded-full"
                                                    style={{
                                                        width: `${
                                                            tastsStats.tasksTotal > 0
                                                                ? (tastsStats.tasksCompleted / tastsStats.tasksTotal) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* <div className="border rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <Clock
                                                        size={18}
                                                        className="text-honor-blue mr-2"
                                                    />
                                                    <p className="font-medium">Среднее время отклика</p>
                                                </div>
                                                <p className="text-2xl font-bold">{district.stats.responseTime} дней</p>
                                            </div> */}
                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <BarChart
                                                        size={18}
                                                        className="text-honor-blue mr-2"
                                                    />
                                                    <p className="font-medium">Представителей</p>
                                                </div>
                                                <p className="text-2xl font-bold">{districtStats.users.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* <Card>
                                <CardHeader>
                                    <CardTitle>Ближайшие события</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {district.events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border-b last:border-b-0 pb-3 last:pb-0">
                                            <div className="flex items-start gap-2">
                                                <Calendar
                                                    size={18}
                                                    className="text-honor-blue mt-1"
                                                />
                                                <div>
                                                    <p className="font-medium">{event.title}</p>
                                                    <p className="text-sm text-honor-darkGray">{event.date}</p>
                                                    <p className="text-sm text-honor-darkGray">{event.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card> */}
                        </div>
                    </TabsContent>

                    <TabsContent value="representatives">
                        <Card>
                            <CardHeader>
                                <CardTitle>Представители округа</CardTitle>
                                <CardDescription>Список представителей власти данного округа</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {districtStats.users.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Представитель</TableHead>
                                                <TableHead>Должность</TableHead>
                                                <TableHead className="text-center">Рейтинг</TableHead>
                                                <TableHead className="text-center">Выполнено задач</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {districtStats.users.map((rep) => (
                                                <TableRow key={rep.id}>
                                                    <TableCell className="font-medium">
                                                        <Link
                                                            to={`/representative/profile/${rep.id}`}
                                                            className="hover:text-honor-blue">
                                                            {rep.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{rep.representativeProfile?.position || '—'}</TableCell>
                                                    <TableCell className="text-center">
                                                        {rep.representativeProfile?.rating ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {rep.representativeProfile?.tasksCompleted ?? '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted-foreground py-6">
                                        Нет представителей в данном округе
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="problems">
                        <Card>
                            <CardHeader>
                                <CardTitle>Проблемы округа</CardTitle>
                                <CardDescription>Актуальные проблемы и задачи данного округа</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {districtStats.tasks.length > 0 ? (
                                    <div className="space-y-4">
                                        {districtStats.tasks.map((task) => (
                                            <Link
                                                key={task.id}
                                                to={`/tasks/${task.id}`}>
                                                <Card className="honor-card mb-4 hover:shadow-lg">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-xl font-bold">{task.title}</h3>
                                                        <TaskStatusBadge status={task.status} />
                                                    </div>

                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center text-honor-darkGray text-sm mb-4">
                                                            <div className="flex items-center">
                                                                <User
                                                                    size={16}
                                                                    className="mr-1"
                                                                />
                                                                <span>{task.assignee.name}</span>
                                                            </div>
                                                            <span className="mx-2">•</span>
                                                            <MapPin
                                                                size={16}
                                                                className="mr-1"
                                                            />
                                                            <span>{task.address}</span>
                                                            <span className="mx-2">•</span>
                                                            <Calendar
                                                                size={16}
                                                                className="mr-1"
                                                            />
                                                            <span>
                                                                До{' '}
                                                                {new Date(
                                                                    task.desiredResolutionDate,
                                                                ).toLocaleDateString('ru-RU')}
                                                            </span>
                                                        </div>

                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto text-honor-blue">
                                                            Подробнее
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center pt-3 border-t justify-end">
                                                        <div className="flex items-center">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm text-honor-darkGray">
                                                                    <Clock
                                                                        size={16}
                                                                        className="inline mr-1"
                                                                    />
                                                                    Создано{' '}
                                                                    {new Date(task.createdAt).toLocaleDateString(
                                                                        'ru-RU',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-6">
                                        Нет задач в данном округе
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* <TabsContent value="events">
                        <Card>
                            <CardHeader>
                                <CardTitle>События округа</CardTitle>
                                <CardDescription>Календарь мероприятий в округе</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {district.events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="border rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-honor-gray rounded-lg p-3 text-center min-w-[60px]">
                                                    <p className="text-xs text-honor-darkGray">
                                                        {new Date(event.date).toLocaleDateString('ru-RU', {
                                                            month: 'short',
                                                        })}
                                                    </p>
                                                    <p className="text-xl font-bold text-honor-blue">
                                                        {new Date(event.date).getDate()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{event.title}</h3>
                                                    <div className="flex items-center text-honor-darkGray text-sm mt-1">
                                                        <MapPin
                                                            size={14}
                                                            className="mr-1"
                                                        />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm">
                                                    <Calendar
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    Добавить в календарь
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent> */}
                </Tabs>

                {/* <div className="mt-8 text-center">
                    <h3 className="text-lg font-semibold mb-4">Хотите помочь своему округу?</h3>
                    <div className="flex justify-center space-x-4">
                        <Link to="/tasks/create">
                            <Button className="honor-button-primary">Создать задачу</Button>
                        </Link>
                        <Link to={`/representatives?district=${district.name}`}>
                            <Button variant="outline">
                                <MessageSquare
                                    size={18}
                                    className="mr-2"
                                />
                                Связаться с представителем
                            </Button>
                        </Link>
                    </div>
                </div> */}
            </div>
        </Layout>
    );
};

export default DistrictDetails;
