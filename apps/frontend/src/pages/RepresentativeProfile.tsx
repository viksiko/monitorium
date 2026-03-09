import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, MapPin, Building, Calendar, Clock, User, Mail, Phone, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import Loader from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';
import { Task, Post } from '@monorepo/types';
import { User as IUser } from '@/types/auth';
import { TasksTab } from '@/components/dashboard';
import TasksTabProfile from '@/components/representative/TasksTabProfile';
import BlogTabProfile from '@/components/representative/BlogTabProfile';
import { formatPartyName } from '@/utils/formatPartyName';
import { Representative } from '@monorepo/types';

const RepresentativeProfile = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { user, refreshUser } = useAuth();
    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [showModifications, setShowModifications] = useState<number | null>(null);

    const [representative, setRepresentative] = useState<Representative | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepresentative = async () => {
            try {
                const response = await api.get(`/api/v1/users/${id}`);
                setRepresentative(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRepresentative();
    }, []);

    const handleLike = (type: string, id: number) => {
        const key = `${type}-${id}`;
        if (liked[key]) return;

        setLiked({ ...liked, [key]: true });
        toast({
            title: 'Реакция учтена',
            description: 'Вы оценили публикацию положительно',
            variant: 'default',
        });
    };

    const handleSubscribe = async () => {
        if (isSubscribed) return;

        try {
            await api.post('/api/v1/subscriptions', {
                representativeId: representative.id,
            });

            await refreshUser();

            toast({
                title: 'Подписка оформлена',
                description: 'Вы подписались на обновления этого представителя власти',
                variant: 'default',
            });
        } catch (error) {
            const message = error?.response?.data?.message || 'Не удалось оформить подписку';

            toast({
                title: 'Ошибка',
                description: message,
                variant: 'destructive',
            });
        }
    };

    const handleSendMessage = () => {
        toast({
            title: 'Сообщение',
            description: 'Для отправки сообщения нужно 10 билетов',
            variant: 'default',
        });
    };

    const isSubscribed =
        representative && user?.subscriptions?.some((sub) => sub.representative.id === representative.id);

    if (loading) {
        return (
            <Layout>
                <div className="honor-container">
                    <Loader />
                </div>
            </Layout>
        );
    }

    if (!representative) {
        return (
            <Layout>
                <div className="honor-container py-12 text-center">Представитель не найден</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold text-honor-darkGray mb-8">Представитель {representative.name}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile sidebar */}
                    <div className="lg:col-span-1">
                        <div className="honor-card mb-6">
                            <div className="flex flex-col items-center mb-6">
                                <Avatar className="h-24 w-24 mb-4">
                                    <User size={48} />
                                </Avatar>
                                <h1 className="text-2xl font-bold text-center">{representative.name}</h1>
                                <p className="text-honor-darkGray">{representative.representativeProfile.position}</p>
                                <div className="flex items-center mt-2">
                                    <MapPin
                                        size={16}
                                        className="text-honor-blue mr-1"
                                    />
                                    <span className="text-sm">{representative.district}</span>
                                </div>
                                <Badge className="mt-2 bg-honor-blue">
                                    {formatPartyName(representative.representativeProfile.party)}
                                </Badge>

                                {/* {mockRepresentative.achievementBadges.map(
                                    (badge) => (
                                        <Badge
                                            key={badge.id}
                                            className="mt-2 bg-green-100 text-green-800">
                                            {badge.name}
                                        </Badge>
                                    ),
                                )} */}
                            </div>

                            <div className="border-t border-b py-4 mb-4">
                                <div className="grid grid-cols-3 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-honor-blue">
                                            {representative.representativeProfile.tasksTotal}
                                        </p>
                                        <p className="text-xs text-honor-darkGray">Всего задач</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-honor-blue">
                                            {representative.representativeProfile.tasksCompleted}
                                        </p>
                                        <p className="text-xs text-honor-darkGray">Выполнено</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-honor-blue">
                                            {representative.representativeProfile.rating}
                                        </p>
                                        <p className="text-xs text-honor-darkGray">Рейтинг</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">О представителе</h3>
                                <p className="text-honor-darkGray text-sm">
                                    {representative.representativeProfile.bio}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Контактная информация</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start">
                                        <Mail
                                            size={16}
                                            className="text-honor-blue mr-2 mt-1"
                                        />
                                        <span>{representative.email}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone
                                            size={16}
                                            className="text-honor-blue mr-2 mt-1"
                                        />
                                        <span>{representative.phone}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Building
                                            size={16}
                                            className="text-honor-blue mr-2 mt-1"
                                        />
                                        <span>{representative.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <Button
                                    className="honor-button-primary"
                                    onClick={handleSubscribe}
                                    disabled={isSubscribed}>
                                    {isSubscribed ? 'Вы подписаны' : 'Подписаться'}
                                </Button>
                                {/* 
                                {user.subscriptions.length > 0 && (
                                    <Button
                                        className="honor-button-secondary"
                                        onClick={handleSendMessage}>
                                        Написать сообщение (10 билетов)
                                    </Button>
                                )} */}
                            </div>
                        </div>
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
                                    value="blog"
                                    className="flex-1">
                                    Блог
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tasks">
                                <TasksTabProfile userId={representative.id} />
                            </TabsContent>

                            <TabsContent value="blog">
                                <BlogTabProfile userId={representative.id} />
                            </TabsContent>

                            {/* <TabsContent
                                value="tasks"
                                className="space-y-6">
                                {tasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        className="honor-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{task.title}</h2>
                                            <div className="flex items-center">
                                                {task.modified && (
                                                    <button
                                                        onClick={() =>
                                                            setShowModifications(
                                                                showModifications === task.id ? null : task.id,
                                                            )
                                                        }
                                                        className="mr-2 text-honor-darkGray hover:text-honor-blue"
                                                        title="Показать историю изменений">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="18"
                                                            height="18"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="lucide lucide-tool">
                                                            <path d="M14.5 12.5 7 20l-3-3 7.5-7.5" />
                                                            <path d="M16 12V4H8" />
                                                            <path d="M17 13a4 4 0 0 0 0 8 4 4 0 0 0 0-8" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <Badge className={getStatusColor(task.status)}>
                                                    {getStatusText(task.status)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {showModifications === task.id && task.modificationHistory.length > 0 && (
                                            <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                                <h3 className="font-semibold mb-2">История изменений:</h3>
                                                <ul className="space-y-2">
                                                    {task.modificationHistory.map((mod, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="text-honor-darkGray">
                                                            <span className="font-medium">
                                                                {new Date(mod.date).toLocaleDateString('ru-RU')}
                                                            </span>{' '}
                                                            - Поле "<span className="italic">{mod.field}</span>"
                                                            изменено с "
                                                            <span className="line-through">{mod.oldValue}</span>" на "
                                                            <span className="font-medium">{mod.newValue}</span>"
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex items-center text-honor-darkGray text-sm mb-4">
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
                                            <span>До {new Date(task.date).toLocaleDateString('ru-RU')}</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-honor-darkGray mb-2">{task.description}</p>
                                            <p className="text-sm font-medium">Решение: {task.solution}</p>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold mb-2">Этапы выполнения</h3>
                                            <div className="space-y-2">
                                                {task.stages.map((stage) => (
                                                    <div
                                                        key={stage.id}
                                                        className="flex items-center">
                                                        <div
                                                            className={`h-4 w-4 rounded-full mr-3 ${stage.completed ? 'bg-honor-blue' : 'border border-honor-darkGray'}`}></div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p
                                                                    className={`${stage.completed ? 'font-medium' : 'text-honor-darkGray'}`}>
                                                                    {stage.title}
                                                                </p>
                                                                <p className="text-xs text-honor-darkGray">
                                                                    {new Date(stage.date).toLocaleDateString('ru-RU')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t">
                                            <div className="flex space-x-4">
                                                <button
                                                    className={`flex items-center space-x-1 ${liked[`task-${task.id}`] ? 'text-honor-blue' : 'text-honor-darkGray hover:text-honor-blue'}`}
                                                    onClick={() => handleLike('task', task.id)}
                                                    disabled={liked[`task-${task.id}`]}>
                                                    <ThumbsUp size={18} />
                                                    <span>
                                                        {liked[`task-${task.id}`] ? task.likes + 1 : task.likes}
                                                    </span>
                                                </button>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <MessageSquare size={18} />
                                                    <span>{task.comments}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <Eye size={18} />
                                                    <span>{task.views}</span>
                                                </div>
                                            </div>
                                            <span className="text-sm text-honor-darkGray">
                                                <Clock
                                                    size={16}
                                                    className="inline mr-1"
                                                />
                                                Обновлено 2 дня назад
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </TabsContent> */}

                            {/* <TabsContent
                                value="blog"
                                className="space-y-6">
                                {mockPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        className="honor-card">
                                        <h2 className="text-xl font-bold mb-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-honor-darkGray mb-4">
                                            <Calendar
                                                size={16}
                                                className="inline mr-1"
                                            />
                                            {new Date(
                                                post.date,
                                            ).toLocaleDateString('ru-RU')}
                                        </p>
                                        <p className="text-honor-darkGray mb-4">
                                            {post.content.substring(0, 200)}...
                                        </p>
                                        <div className="flex justify-between items-center pt-3 border-t">
                                            <div className="flex space-x-4">
                                                <button
                                                    className={`flex items-center space-x-1 ${liked[`post-${post.id}`] ? 'text-honor-blue' : 'text-honor-darkGray hover:text-honor-blue'}`}
                                                    onClick={() =>
                                                        handleLike(
                                                            'post',
                                                            post.id,
                                                        )
                                                    }
                                                    disabled={
                                                        liked[`post-${post.id}`]
                                                    }>
                                                    <ThumbsUp size={18} />
                                                    <span>
                                                        {liked[
                                                            `post-${post.id}`
                                                        ]
                                                            ? post.likes + 1
                                                            : post.likes}
                                                    </span>
                                                </button>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <MessageSquare size={18} />
                                                    <span>{post.comments}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <Eye size={18} />
                                                    <span>{post.views}</span>
                                                </div>
                                            </div>
                                            <Link to={`/blog/${post.id}`}>
                                                <Button
                                                    variant="link"
                                                    className="text-honor-blue p-0">
                                                    Читать полностью
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))}

                                <div className="text-center mt-8">
                                    <Link to={`/representative/${id}/blog`}>
                                        <Button className="honor-button-secondary">
                                            Все публикации
                                        </Button>
                                    </Link>
                                </div>
                            </TabsContent> */}
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeProfile;
