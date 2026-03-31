import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Representative, Task } from '@monorepo/types';
import { api } from '@/lib/api';

// Используем моковые данные из Map.tsx
const mockDistricts = [
    {
        id: 1,
        name: 'Округ №1',
        description: 'Центральный район',
        representatives: [
            {
                id: 101,
                name: 'Иванов И.И.',
                type: 'депутат',
                position: 'Депутат городской думы',
                rating: 4.5,
                tasksCompleted: 45,
                lastActivity: '2025-05-02',
                attendance: 87,
            },
            {
                id: 102,
                name: 'Петров П.П.',
                type: 'чиновник',
                position: 'Глава района',
                rating: 3.8,
                tasksCompleted: 32,
                lastActivity: '2025-05-01',
                attendance: 92,
            },
            {
                id: 103,
                name: 'Сидорова А.В.',
                type: 'муниципальный служащий',
                position: 'Начальник отдела благоустройства',
                rating: 4.2,
                tasksCompleted: 38,
                lastActivity: '2025-04-28',
                attendance: 79,
            },
        ],
        problems: [
            {
                id: 1001,
                title: 'Ремонт дороги',
                status: 'в работе',
                priority: 'высокий',
                createdAt: '2025-04-15',
            },
            {
                id: 1002,
                title: 'Освещение парка',
                status: 'выполнено',
                priority: 'средний',
                createdAt: '2025-03-20',
            },
        ],
        stats: {
            tasksTotal: 65,
            tasksCompleted: 48,
            tasksInProgress: 17,
            satisfactionRate: 76,
            responseTime: 2.3,
        },
        events: [
            {
                id: 2001,
                title: 'Встреча с жителями',
                date: '2025-05-20',
                location: 'ДК Центральный',
            },
            {
                id: 2002,
                title: 'Субботник',
                date: '2025-05-25',
                location: 'Парк Центральный',
            },
        ],
        boundaries: [
            [55.751, 37.617],
            [55.755, 37.627],
            [55.761, 37.624],
            [55.759, 37.614],
        ],
    },
    {
        id: 2,
        name: 'Округ №2',
        description: 'Советский район',
        representatives: [
            {
                id: 201,
                name: 'Смирнов К.Н.',
                type: 'депутат',
                position: 'Депутат городской думы',
                rating: 4.1,
                tasksCompleted: 39,
                lastActivity: '2025-05-03',
                attendance: 81,
            },
            {
                id: 202,
                name: 'Кузнецова О.Д.',
                type: 'чиновник',
                position: 'Заместитель главы района',
                rating: 3.9,
                tasksCompleted: 28,
                lastActivity: '2025-04-29',
                attendance: 88,
            },
        ],
        problems: [
            {
                id: 2001,
                title: 'Благоустройство двора',
                status: 'запланировано',
                priority: 'средний',
                createdAt: '2025-04-25',
            },
            {
                id: 2002,
                title: 'Ремонт детской площадки',
                status: 'в работе',
                priority: 'высокий',
                createdAt: '2025-04-10',
            },
        ],
        stats: {
            tasksTotal: 55,
            tasksCompleted: 37,
            tasksInProgress: 18,
            satisfactionRate: 72,
            responseTime: 2.7,
        },
        events: [
            {
                id: 3001,
                title: 'Прием граждан',
                date: '2025-05-15',
                location: 'Администрация района',
            },
            {
                id: 3002,
                title: 'Открытие детского сада',
                date: '2025-06-01',
                location: 'ул. Советская, 15',
            },
        ],
        boundaries: [
            [55.731, 37.587],
            [55.735, 37.597],
            [55.741, 37.594],
            [55.739, 37.584],
        ],
    },
    {
        id: 3,
        name: 'Округ №3',
        description: 'Промышленный район',
        representatives: [
            {
                id: 301,
                name: 'Андреев А.А.',
                type: 'депутат',
                position: 'Депутат городской думы',
                rating: 3.7,
                tasksCompleted: 31,
                lastActivity: '2025-05-01',
                attendance: 75,
            },
            {
                id: 302,
                name: 'Волков С.Г.',
                type: 'чиновник',
                position: 'Глава района',
                rating: 4.0,
                tasksCompleted: 42,
                lastActivity: '2025-05-04',
                attendance: 83,
            },
            {
                id: 303,
                name: 'Соколова И.П.',
                type: 'муниципальный служащий',
                position: 'Начальник отдела ЖКХ',
                rating: 3.5,
                tasksCompleted: 25,
                lastActivity: '2025-04-25',
                attendance: 80,
            },
            {
                id: 304,
                name: 'Морозов Д.К.',
                type: 'муниципальный служащий',
                position: 'Специалист по благоустройству',
                rating: 4.3,
                tasksCompleted: 36,
                lastActivity: '2025-04-30',
                attendance: 95,
            },
        ],
        problems: [
            {
                id: 3001,
                title: 'Реконструкция завода',
                status: 'запланировано',
                priority: 'высокий',
                createdAt: '2025-04-05',
            },
            {
                id: 3002,
                title: 'Экологический мониторинг',
                status: 'в работе',
                priority: 'высокий',
                createdAt: '2025-03-15',
            },
            {
                id: 3003,
                title: 'Строительство спортплощадки',
                status: 'выполнено',
                priority: 'средний',
                createdAt: '2025-02-10',
            },
        ],
        stats: {
            tasksTotal: 78,
            tasksCompleted: 52,
            tasksInProgress: 26,
            satisfactionRate: 68,
            responseTime: 3.1,
        },
        events: [
            {
                id: 4001,
                title: 'Общественные слушания',
                date: '2025-05-18',
                location: 'Администрация района',
            },
            {
                id: 4002,
                title: 'Экологическая акция',
                date: '2025-05-30',
                location: 'Парк Промышленный',
            },
        ],
        boundaries: [
            [55.711, 37.557],
            [55.715, 37.567],
            [55.721, 37.564],
            [55.719, 37.554],
        ],
    },
    {
        id: 4,
        name: 'Округ №4',
        description: 'Ленинский район',
        representatives: [
            {
                id: 401,
                name: 'Лебедев М.С.',
                type: 'депутат',
                position: 'Депутат городской думы',
                rating: 4.4,
                tasksCompleted: 47,
                lastActivity: '2025-05-03',
                attendance: 91,
            },
            {
                id: 402,
                name: 'Козлов И.А.',
                type: 'муниципальный служащий',
                position: 'Начальник отдела образования',
                rating: 4.2,
                tasksCompleted: 35,
                lastActivity: '2025-04-29',
                attendance: 86,
            },
        ],
        problems: [
            {
                id: 4001,
                title: 'Ремонт школы',
                status: 'в работе',
                priority: 'высокий',
                createdAt: '2025-04-20',
            },
            {
                id: 4002,
                title: 'Обновление библиотеки',
                status: 'запланировано',
                priority: 'средний',
                createdAt: '2025-04-15',
            },
        ],
        stats: {
            tasksTotal: 62,
            tasksCompleted: 45,
            tasksInProgress: 17,
            satisfactionRate: 82,
            responseTime: 2.0,
        },
        events: [
            {
                id: 5001,
                title: 'День района',
                date: '2025-06-12',
                location: 'Площадь Ленина',
            },
            {
                id: 5002,
                title: 'Образовательный форум',
                date: '2025-05-22',
                location: 'Школа №5',
            },
        ],
        boundaries: [
            [55.751, 37.647],
            [55.755, 37.657],
            [55.761, 37.654],
            [55.759, 37.644],
        ],
    },
    {
        id: 5,
        name: 'Округ №5',
        description: 'Кировский район',
        representatives: [
            {
                id: 501,
                name: 'Никитин В.П.',
                type: 'депутат',
                position: 'Депутат городской думы',
                rating: 3.6,
                tasksCompleted: 29,
                lastActivity: '2025-04-28',
                attendance: 77,
            },
            {
                id: 502,
                name: 'Зайцева Н.О.',
                type: 'чиновник',
                position: 'Заместитель главы района',
                rating: 3.9,
                tasksCompleted: 33,
                lastActivity: '2025-05-02',
                attendance: 84,
            },
            {
                id: 503,
                name: 'Орлов П.С.',
                type: 'муниципальный служащий',
                position: 'Начальник отдела транспорта',
                rating: 4.0,
                tasksCompleted: 31,
                lastActivity: '2025-05-01',
                attendance: 89,
            },
        ],
        problems: [
            {
                id: 5001,
                title: 'Организация транспортных маршрутов',
                status: 'в работе',
                priority: 'высокий',
                createdAt: '2025-04-10',
            },
            {
                id: 5002,
                title: 'Ремонт фасадов зданий',
                status: 'запланировано',
                priority: 'средний',
                createdAt: '2025-04-05',
            },
            {
                id: 5003,
                title: 'Благоустройство сквера',
                status: 'выполнено',
                priority: 'средний',
                createdAt: '2025-03-15',
            },
        ],
        stats: {
            tasksTotal: 70,
            tasksCompleted: 43,
            tasksInProgress: 27,
            satisfactionRate: 71,
            responseTime: 2.8,
        },
        events: [
            {
                id: 6001,
                title: 'Встреча с предпринимателями',
                date: '2025-05-17',
                location: "Бизнес-центр 'Кировский'",
            },
            {
                id: 6002,
                title: 'Спортивный праздник',
                date: '2025-06-05',
                location: "Стадион 'Динамо'",
            },
        ],
        boundaries: [
            [55.731, 37.617],
            [55.735, 37.627],
            [55.741, 37.624],
            [55.739, 37.614],
        ],
    },
];

const DistrictDetails = () => {
    const { id } = useParams();
    const districtId = parseInt(id || '0');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [representatives, setRepresentatives] = useState<Representative[]>([]);

    const district = mockDistricts.find((d) => d.id === districtId);

    useEffect(() => {
        if (!district?.name) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const [usersRes, tasksRes] = await Promise.all([
                    api.get('/api/v1/users/filter', {
                        params: {
                            role: 'representative',
                            district: district.name,
                        },
                    }),
                    api.get('/api/v1/tasks/filter', {
                        params: {
                            district: district.name,
                        },
                    }),
                ]);

                setRepresentatives(usersRes.data.data);
                setTasks(tasksRes.data.data);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [district?.name]);

    console.log('t', tasks, representatives);

    if (!district) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <Card className="honor-card">
                        <CardHeader>
                            <CardTitle>Округ не найден</CardTitle>
                            <CardDescription>Информация по запрошенному округу отсутствует</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/map">
                                <Button className="honor-button-primary">
                                    <ArrowLeft
                                        size={18}
                                        className="mr-2"
                                    />
                                    Вернуться к карте округов
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="mb-6">
                    <Link
                        to="/map"
                        className="inline-flex items-center text-honor-darkGray hover:text-honor-blue mb-4">
                        <ArrowLeft
                            size={18}
                            className="mr-2"
                        />
                        <span>Вернуться к карте</span>
                    </Link>

                    <div className="flex items-center mb-2">
                        <MapPin
                            className="text-honor-blue mr-2"
                            size={24}
                        />
                        <h1 className="text-3xl font-bold">{district.name}</h1>
                    </div>
                    <p className="text-honor-darkGray">{district.description}</p>
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
                                                    {district.stats.tasksTotal}
                                                </p>
                                            </div>
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">Выполнено</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {district.stats.tasksCompleted}
                                                </p>
                                            </div>
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">В процессе</p>
                                                <p className="text-2xl font-bold text-amber-600">
                                                    {district.stats.tasksInProgress}
                                                </p>
                                            </div>
                                            <div className="bg-honor-gray rounded-lg p-4">
                                                <p className="text-sm text-honor-darkGray">Удовлетворенность</p>
                                                <p className="text-2xl font-bold text-honor-blue">
                                                    {district.stats.satisfactionRate}%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-honor-gray rounded-lg p-4">
                                            <div className="flex justify-between mb-2">
                                                <p className="text-sm font-medium">Прогресс выполнения задач</p>
                                                <p className="text-sm text-honor-darkGray">
                                                    {Math.round(
                                                        (district.stats.tasksCompleted / district.stats.tasksTotal) *
                                                            100,
                                                    )}
                                                    %
                                                </p>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-2.5">
                                                <div
                                                    className="bg-honor-blue h-2.5 rounded-full"
                                                    style={{
                                                        width: `${(district.stats.tasksCompleted / district.stats.tasksTotal) * 100}%`,
                                                    }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <Clock
                                                        size={18}
                                                        className="text-honor-blue mr-2"
                                                    />
                                                    <p className="font-medium">Среднее время отклика</p>
                                                </div>
                                                <p className="text-2xl font-bold">{district.stats.responseTime} дней</p>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <BarChart
                                                        size={18}
                                                        className="text-honor-blue mr-2"
                                                    />
                                                    <p className="font-medium">Представителей</p>
                                                </div>
                                                <p className="text-2xl font-bold">{district.representatives.length}</p>
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Представитель</TableHead>
                                            <TableHead>Должность</TableHead>
                                            <TableHead className="text-center">Тип</TableHead>
                                            <TableHead className="text-center">Рейтинг</TableHead>
                                            <TableHead className="text-center">Выполнено задач</TableHead>
                                            <TableHead className="text-center">Посещаемость</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {district.representatives.map((rep) => (
                                            <TableRow key={rep.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        to={`/representative/profile/${rep.id}`}
                                                        className="hover:text-honor-blue">
                                                        {rep.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{rep.position}</TableCell>
                                                <TableCell className="text-center">{rep.type}</TableCell>
                                                <TableCell className="text-center">{rep.rating}</TableCell>
                                                <TableCell className="text-center">{rep.tasksCompleted}</TableCell>
                                                <TableCell className="text-center">{rep.attendance}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                                <div className="space-y-4">
                                    {district.problems.map((problem) => (
                                        <div
                                            key={problem.id}
                                            className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle
                                                        size={18}
                                                        className={
                                                            problem.priority === 'высокий'
                                                                ? 'text-red-600 mt-1'
                                                                : 'text-amber-600 mt-1'
                                                        }
                                                    />
                                                    <div>
                                                        <h3 className="font-bold">{problem.title}</h3>
                                                        <p className="text-sm text-honor-darkGray">
                                                            Создано: {problem.createdAt}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={
                                                        problem.status === 'выполнено'
                                                            ? 'bg-green-100 text-green-800'
                                                            : problem.status === 'в работе'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-orange-100 text-orange-800'
                                                    }>
                                                    {problem.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-end mt-4">
                                                <Link to={`/tasks/${problem.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm">
                                                        Подробнее
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events">
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
                    </TabsContent>
                </Tabs>

                <div className="mt-8 text-center">
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
                </div>
            </div>
        </Layout>
    );
};

export default DistrictDetails;
