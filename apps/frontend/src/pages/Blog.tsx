import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Calendar, ThumbsUp, MessageSquare, User, Clock, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock blog posts
const mockPosts = [
    {
        id: 1,
        title: 'Отчет о проделанной работе за первый квартал 2025 года',
        excerpt:
            'За первый квартал 2025 года нам удалось реализовать несколько важных проектов, направленных на благоустройство нашего района...',
        content: `
      <h2>Отчет о проделанной работе за первый квартал 2025 года</h2>
      
      <p>Уважаемые избиратели!</p>
      
      <p>За первый квартал 2025 года нам удалось реализовать несколько важных проектов, направленных на благоустройство нашего района.</p>
      
      <h3>Основные достижения:</h3>
      
      <ol>
        <li>Завершен ремонт дорожного покрытия на улицах Ленина и Пушкина</li>
        <li>Установлены новые детские площадки в трех дворах</li>
        <li>Проведена модернизация системы освещения в парке</li>
        <li>Организованы общественные слушания по вопросу строительства новой школы</li>
      </ol>
      
      <p>В следующем квартале планируется:</p>
      
      <ul>
        <li>Начать строительство нового спортивного комплекса</li>
        <li>Провести озеленение центральной площади</li>
        <li>Реализовать программу поддержки малого бизнеса</li>
      </ul>
      
      <p>Благодарю всех жителей за активное участие в жизни нашего района!</p>
    `,
        date: '2025-04-01',
        likes: 42,
        comments: 7,
        author: 'Иванов Иван Иванович',
        authorRole: 'Депутат городской думы',
    },
    {
        id: 2,
        title: 'Встреча с жителями микрорайона «Солнечный»',
        excerpt:
            'Вчера провел встречу с жителями микрорайона «Солнечный». Обсудили насущные проблемы и наметили пути их решения...',
        content: `
      <h2>Встреча с жителями микрорайона «Солнечный»</h2>
      
      <p>Вчера провел встречу с жителями микрорайона «Солнечный». Обсудили насущные проблемы и наметили пути их решения.</p>
      
      <p>Основные вопросы, которые волнуют жителей:</p>
      
      <ul>
        <li>Недостаточное количество парковочных мест</li>
        <li>Отсутствие современной детской площадки</li>
        <li>Необходимость ремонта внутридворовых проездов</li>
      </ul>
      
      <p>По итогам встречи принято решение:</p>
      
      <ol>
        <li>Подготовить проект расширения парковочной зоны</li>
        <li>Включить микрорайон в программу установки детских площадок на следующий год</li>
        <li>Провести ремонт проездов до конца текущего года</li>
      </ol>
      
      <p>Благодарю всех жителей за конструктивный диалог и активную гражданскую позицию!</p>
    `,
        date: '2025-05-01',
        likes: 35,
        comments: 9,
        author: 'Иванов Иван Иванович',
        authorRole: 'Депутат городской думы',
    },
];

const Blog = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const [selectedPost, setSelectedPost] = useState(id ? mockPosts.find((post) => post.id === parseInt(id)) : null);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: 'Ссылка скопирована',
            description: 'Ссылка на статью скопирована в буфер обмена',
            variant: 'default',
        });
    };

    const handleLike = () => {
        toast({
            title: 'Спасибо за вашу оценку',
            description: 'Ваш лайк учтен',
            variant: 'default',
        });
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="honor-card mb-6">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Блог представителя</h2>
                                <div className="flex items-center mb-6">
                                    <Avatar className="justify-center items-centerh-12 w-12 mr-4">
                                        <User size={24} />
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold">Иванов Иван Иванович</h3>
                                        <p className="text-sm text-honor-darkGray">Депутат городской думы</p>
                                    </div>
                                </div>

                                <Button className="w-full honor-button-primary mb-2">Подписаться на блог</Button>
                                <Button className="w-full honor-button-secondary">Профиль представителя</Button>
                            </div>

                            <Separator />

                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Последние публикации</h3>
                                <div className="space-y-4">
                                    {mockPosts.map((post) => (
                                        <button
                                            key={post.id}
                                            className={`w-full text-left p-3 rounded-xl transition-colors ${
                                                selectedPost?.id === post.id
                                                    ? 'bg-honor-blue/10'
                                                    : 'hover:bg-honor-gray'
                                            }`}
                                            onClick={() => setSelectedPost(post)}>
                                            <h4 className="font-medium line-clamp-2">{post.title}</h4>
                                            <p className="text-xs text-honor-darkGray mt-1">
                                                {new Date(post.date).toLocaleDateString('ru-RU')}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        {selectedPost ? (
                            <Card className="honor-card">
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <Avatar className="justify-center items-centerh-10 w-10 mr-3">
                                            <User size={20} />
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{selectedPost.author}</p>
                                            <p className="text-xs text-honor-darkGray">{selectedPost.authorRole}</p>
                                        </div>
                                        <div className="ml-auto text-sm text-honor-darkGray">
                                            <Calendar
                                                size={14}
                                                className="inline mr-1"
                                            />
                                            {new Date(selectedPost.date).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>

                                    <h1 className="text-2xl font-bold mb-4">{selectedPost.title}</h1>

                                    <div
                                        className="prose max-w-none mb-6"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedPost.content,
                                        }}
                                    />

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="flex space-x-4">
                                            <button
                                                className="flex items-center space-x-1 text-honor-darkGray hover:text-honor-blue"
                                                onClick={handleLike}>
                                                <ThumbsUp size={18} />
                                                <span>{selectedPost.likes}</span>
                                            </button>
                                            <div className="flex items-center space-x-1 text-honor-darkGray">
                                                <MessageSquare size={18} />
                                                <span>{selectedPost.comments}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="text-honor-darkGray hover:text-honor-blue"
                                            onClick={handleShare}>
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-bold mb-4">Выберите публикацию</h2>
                                <p className="text-honor-darkGray">
                                    Выберите публикацию из списка слева, чтобы прочитать полный текст
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Blog;
