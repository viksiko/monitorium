// components/post/PostCard.tsx

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Clock, MapPin, UserStar } from 'lucide-react';
import { Post } from '@monorepo/types'; // поправь тип если нужно

type Props = {
    post: Post;
};

const PostCard = ({ post }: Props) => {
    return (
        <Link to={`/posts/${post.id}`}>
            <Card className="honor-card mb-4 hover:shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col w-full">
                        <h3 className="text-xl font-bold mb-4">{post.title}</h3>
                        {/* {task.hasEscalation && <Badge className="ml-2 bg-red-100 text-red-800">Эскалация</Badge>} */}
                        <div className="flex justify-between items-center w-full">
                            {/* <div>{post.content?.length > 200 ? post.content.slice(0, 200) + '...' : post.content}</div> */}
                            <div className="flex items-center text-honor-darkGray text-sm mb-4">
                                <div className="flex items-center">
                                    <UserStar
                                        size={16}
                                        className="mr-1"
                                    />
                                    <span>{post.author.name}</span>
                                </div>
                                <span className="mx-2">•</span>
                                <MapPin
                                    size={16}
                                    className="mr-1"
                                />
                                <span>{post.author.district.name}</span>
                            </div>
                            <Button
                                variant="link"
                                className="p-0 h-auto text-honor-blue">
                                Подробнее
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex space-x-4">
                        <div className="flex items-center space-x-1 text-honor-darkGray">
                            <ThumbsUp size={18} />
                            <span>{post.likesCount}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-honor-darkGray">
                            <MessageSquare size={18} />
                            {/* <span>{post.comments?.length ?? 0}</span> */}
                        </div>
                    </div>

                    <span className="text-sm text-honor-darkGray">
                        <Clock
                            size={16}
                            className="inline mr-1"
                        />
                        Создано {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                </div>
            </Card>
        </Link>
    );
};

export default PostCard;
