import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    User,
    Users,
    MapPin,
    Plus,
    MessageSquare,
    ThumbsUp,
    Star,
    BarChart3,
    CheckCircle,
    Clock,
    BookType,
    FilePen,
} from 'lucide-react';
import { useGetLatestTasks } from '@/lib/query/task.query';
import { useGetLatestPosts } from '@/lib/query/post.query';
import Loader from '@/components/ui/loader';
import { post } from '@/lib/generated';

const Index: React.FC = () => {
    const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useGetLatestTasks();
    const { data: posts, isLoading: postsLoading, isError: postsError } = useGetLatestPosts();

    // Mock statistics for the platform
    const platformStats = {
        activeUsers: 12547,
        completedTasks: 3876,
        activeRepresentatives: 342,
        avgResponseTime: '8 часов',
        satisfactionRate: '87%',
    };

    const test = [];

    return (
        <Layout>
            {/* Hero section */}
            <div className="bg-gradient-to-r from-honor-blue to-honor-darkBlue text-white py-16">
                <div className="honor-container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Платформа «Мониториум»</h1>
                            <p className="text-lg md:text-xl mb-8">
                                Цифровая платформа для прямого взаимодействия между избирателями и представителями
                                власти
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to="/register"
                                    className="w-full sm:w-1/2">
                                    <Button className="bg-white text-honor-blue hover:bg-gray-100 font-bold px-6 py-6 rounded-xl w-full">
                                        Для избирателей
                                    </Button>
                                </Link>
                                <Link
                                    to="/register/representative"
                                    className="w-full sm:w-1/2">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 font-bold px-6 py-6 rounded-xl w-full">
                                        Для представителей власти
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="lg:flex justify-center hidden">
                            <img
                                src="/placeholder.svg"
                                alt="Платформа Честь"
                                className="max-w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features section */}
            <div className="py-16 bg-gray-50">
                <div className="honor-container">
                    <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Link
                            to="/map"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <MapPin
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Карта округов</h3>
                                <p className="text-honor-darkGray">
                                    Интерактивная карта избирательных округов с информацией о представителях и активных
                                    заданиях
                                </p>
                            </Card>
                        </Link>

                        <Link
                            to="/tasks/create"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <Plus
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Создание заданий</h3>
                                <p className="text-honor-darkGray">
                                    Возможность создавать конкретные задания для представителей власти и отслеживать их
                                    выполнение
                                </p>
                            </Card>
                        </Link>

                        <Link
                            to="/messages"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <MessageSquare
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Система сообщений</h3>
                                <p className="text-honor-darkGray">
                                    Прямое общение между избирателями и представителями власти через встроенный
                                    мессенджер
                                </p>
                            </Card>
                        </Link>

                        <Link
                            to="/representatives"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <Users
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Профили представителей</h3>
                                <p className="text-honor-darkGray">
                                    Подробная информация о представителях власти, их деятельности и результатах работы
                                </p>
                            </Card>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <ThumbsUp
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Система оценки</h3>
                                <p className="text-honor-darkGray">
                                    Возможность оценивать работу представителей власти и оставлять отзывы о выполненных
                                    заданиях
                                </p>
                            </Card>
                        </Link>

                        <Link
                            to="/representatives"
                            className="block transition-transform hover:scale-105">
                            <Card className="p-6 h-full cursor-pointer hover:shadow-md transition-shadow">
                                <div className="bg-honor-blue/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                                    <Star
                                        className="text-honor-blue"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Система рейтинга</h3>
                                <p className="text-honor-darkGray">
                                    Рейтинговая система для представителей власти на основе активности и качества
                                    выполнения заданий
                                </p>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>

            {/* How it works section */}
            <div className="py-16">
                <div className="honor-container">
                    <h2 className="text-3xl font-bold text-center mb-4">Как это работает</h2>
                    <p className="text-honor-darkGray text-center max-w-2xl mx-auto mb-12">
                        Простой процесс взаимодействия избирателей и представителей власти
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-honor-gray rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <User
                                    className="text-honor-blue"
                                    size={32}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Шаг 1</h3>
                            <p className="text-honor-darkGray">
                                Зарегистрируйтесь на платформе как избиратель или представитель власти
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-honor-gray rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <MapPin
                                    className="text-honor-blue"
                                    size={32}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Шаг 2</h3>
                            <p className="text-honor-darkGray">
                                Найдите свой избирательный округ на интерактивной карте
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-honor-gray rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare
                                    className="text-honor-blue"
                                    size={32}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Шаг 3</h3>
                            <p className="text-honor-darkGray">
                                Создавайте задания, общайтесь с представителями и отслеживайте результаты
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/register">
                            <Button className="honor-button-primary text-lg px-8 py-6">
                                Начать пользоваться платформой
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Platform statistics section */}
            <div className="py-16 bg-honor-blue/5">
                <div className="honor-container">
                    <h2 className="text-3xl font-bold text-center mb-4">Статистика платформы</h2>
                    <p className="text-honor-darkGray text-center max-w-2xl mx-auto mb-12">
                        Актуальные данные о работе платформы «Честь»
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        <Card className="p-4 text-center hover:shadow-md transition-shadow">
                            <Users className="h-8 w-8 mx-auto mb-2 text-honor-blue" />
                            <p className="text-sm text-honor-darkGray">Активных пользователей</p>
                            <p className="text-2xl font-bold">{platformStats.activeUsers.toLocaleString('ru-RU')}</p>
                        </Card>

                        <Card className="p-4 text-center hover:shadow-md transition-shadow">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-honor-darkGray">Выполнено задач</p>
                            <p className="text-2xl font-bold">{platformStats.completedTasks.toLocaleString('ru-RU')}</p>
                        </Card>

                        <Card className="p-4 text-center hover:shadow-md transition-shadow">
                            <User className="h-8 w-8 mx-auto mb-2 text-honor-blue" />
                            <p className="text-sm text-honor-darkGray">Представителей власти</p>
                            <p className="text-2xl font-bold">
                                {platformStats.activeRepresentatives.toLocaleString('ru-RU')}
                            </p>
                        </Card>

                        <Card className="p-4 text-center hover:shadow-md transition-shadow">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                            <p className="text-sm text-honor-darkGray">Среднее время ответа</p>
                            <p className="text-2xl font-bold">{platformStats.avgResponseTime}</p>
                        </Card>

                        <Card className="p-4 text-center hover:shadow-md transition-shadow">
                            <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="text-sm text-honor-darkGray">Уровень удовлетворенности</p>
                            <p className="text-2xl font-bold">{platformStats.satisfactionRate}</p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* New section: Recent activity */}
            <div className="py-16 bg-gray-50">
                <div className="honor-container">
                    <h2 className="text-3xl font-bold text-center mb-12">Недавняя активность</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-6 pb-16">
                            <h3 className="text-xl font-bold mb-4">Последние задачи</h3>
                            {tasksLoading ? (
                                <div className="text-center">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-between">
                                    {tasks.length === 0 ? (
                                        <p className="text-honor-darkGray">Пока нет задач</p>
                                    ) : (
                                        <>
                                            {tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center p-3 bg-honor-gray rounded-lg">
                                                    <div className="bg-honor-blue/10 rounded-full p-2 mr-3">
                                                        <BookType
                                                            className="text-honor-blue"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-medium">
                                                            {task.title.length > 40
                                                                ? `${task.title.slice(0, 40)}...`
                                                                : task.title}
                                                        </p>
                                                        <p className="text-sm text-honor-darkGray">
                                                            {task.district.name}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-honor-darkGray">
                                                        Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            ))}

                                            <Link
                                                to="/tasks"
                                                className="block text-center text-honor-blue hover:underline pt-2">
                                                Смотреть все задачи
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 pb-16">
                            <h3 className="text-xl font-bold mb-4">Последние публикации</h3>
                            {postsLoading ? (
                                <div className="text-center">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-between">
                                    {posts.length === 0 ? (
                                        <p className="text-honor-darkGray">Пока нет публикаций</p>
                                    ) : (
                                        <>
                                            {posts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    className="flex items-center p-3 bg-honor-gray rounded-lg">
                                                    <div className="bg-honor-blue/10 rounded-full p-2 mr-3">
                                                        <FilePen
                                                            className="text-honor-blue"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-medium">
                                                            {post.title.length > 40
                                                                ? `${post.title.slice(0, 40)}...`
                                                                : post.title}
                                                        </p>
                                                        <p className="text-sm text-honor-darkGray">
                                                            {post.author.name}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-honor-darkGray">
                                                        Создано {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            ))}
                                            <Link
                                                to="/posts"
                                                className="block text-center text-honor-blue hover:underline pt-2">
                                                Смотреть все публикации
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Index;
