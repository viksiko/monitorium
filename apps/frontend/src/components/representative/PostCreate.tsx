import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useApi } from '@/hooks/useApi';
import { Post } from '@monorepo/types';
import Layout from '@/components/layout/Layout';

const PostCreate = () => {
    const { toast } = useToast();
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const { loading, error, request } = useApi<Post>();

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await request({
                method: 'POST',
                url: '/api/v1/posts',
                data: {
                    title: newPostTitle,
                    content: newPostContent,
                },
            });

            toast({
                title: 'Публикация создана',
                description: 'Ваша публикация успешно создана и опубликована',
                variant: 'default',
            });

            setNewPostTitle('');
            setNewPostContent('');
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось создать публикацию',
                variant: 'destructive',
            });
        }
    };

    return (
        <>
            <Layout>
                <div className="honor-container py-12">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8 text-center">Новая публикация в блог</h1>
                        <Card className="honor-card">
                            <form onSubmit={handleCreatePost}>
                                <div className="mb-4">
                                    <Label
                                        htmlFor="post-title"
                                        className="block mb-2">
                                        Заголовок
                                    </Label>
                                    <Input
                                        id="post-title"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        className="honor-input"
                                        placeholder="Введите заголовок публикации"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label
                                        htmlFor="post-content"
                                        className="block mb-2">
                                        Содержание
                                    </Label>
                                    <Textarea
                                        id="post-content"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="honor-input min-h-[200px]"
                                        placeholder="Введите текст публикации..."
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <Label className="block mb-2">Приложенные файлы</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                        <p className="text-honor-darkGray mb-2">
                                            Перетащите файлы сюда или нажмите для выбора
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-honor-blue">
                                            Выбрать файлы
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-honor-darkGray">
                                        <AlertCircle
                                            size={16}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Публикация будет видна всем избирателям</span>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="honor-button-primary">
                                        {loading ? 'Публикация...' : 'Опубликовать'}
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* <div className="mt-6 text-center">
                            <Link to="/blog">
                                <Button className="honor-button-secondary">Перейти в мой блог</Button>
                            </Link>
                        </div> */}
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default PostCreate;
