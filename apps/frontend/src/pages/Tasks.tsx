import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Clock, Plus, ThumbsUp, MessageSquare, Search, Filter } from 'lucide-react';

// Моковые данные задач
const tasks = [
    {
        id: 1,
        title: 'Ремонт дороги на ул. Ленина',
        address: 'ул. Ленина, 10-20',
        status: 'in-progress',
        date: '2025-08-15',
        likes: 24,
        comments: 5,
        createdAt: '2025-05-01',
        district: 'Округ №1',
    },
    {
        id: 2,
        title: 'Установка детской площадки',
        address: 'ул. Пушкина, 42',
        status: 'completed',
        date: '2025-04-20',
        likes: 56,
        comments: 12,
        createdAt: '2025-03-15',
        district: 'Округ №2',
    },
    {
        id: 3,
        title: 'Озеленение сквера',
        address: 'Центральный сквер',
        status: 'planned',
        date: '2025-09-30',
        likes: 38,
        comments: 8,
        createdAt: '2025-04-15',
        district: 'Округ №1',
    },
    {
        id: 4,
        title: 'Ремонт детского сада №7',
        address: 'ул. Гагарина, 15',
        status: 'planned',
        date: '2025-10-15',
        likes: 42,
        comments: 7,
        createdAt: '2025-05-10',
        district: 'Округ №3',
    },
];

const Tasks = () => {
    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Задачи и обращения</h1>
                            <p className="text-honor-darkGray">
                                Список всех публичных задач и обращений от избирателей
                            </p>
                        </div>
                        <Link
                            to="/tasks/create"
                            className="mt-4 md:mt-0">
                            <Button className="honor-button-primary flex items-center">
                                <Plus
                                    size={18}
                                    className="mr-2"
                                />
                                Создать задачу
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    placeholder="Поиск задач..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center">
                            <Filter
                                size={18}
                                className="mr-2"
                            />
                            Фильтры
                        </Button>
                    </div>

                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            className="honor-card mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <Link to={`/tasks/${task.id}`}>
                                    <h3 className="text-xl font-bold hover:text-honor-blue">{task.title}</h3>
                                </Link>
                                <Badge
                                    className={
                                        task.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : task.status === 'in-progress'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-orange-100 text-orange-800'
                                    }>
                                    {task.status === 'completed'
                                        ? 'Выполнено'
                                        : task.status === 'in-progress'
                                          ? 'В процессе'
                                          : 'Запланировано'}
                                </Badge>
                            </div>

                            <div className="flex items-center text-honor-darkGray text-sm mb-4">
                                <MapPin
                                    size={16}
                                    className="mr-1"
                                />
                                <span>{task.address}</span>
                                <span className="mx-2">•</span>
                                <span>{task.district}</span>
                                <span className="mx-2">•</span>
                                <Calendar
                                    size={16}
                                    className="mr-1"
                                />
                                <span>До {new Date(task.date).toLocaleDateString('ru-RU')}</span>
                            </div>

                            <div className="flex justify-between items-center mb-2">
                                <div className="flex space-x-4">
                                    <div className="flex items-center space-x-1 text-honor-darkGray">
                                        <ThumbsUp size={18} />
                                        <span>{task.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-honor-darkGray">
                                        <MessageSquare size={18} />
                                        <span>{task.comments}</span>
                                    </div>
                                </div>
                                <span className="text-sm text-honor-darkGray">
                                    <Clock
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Tasks;
