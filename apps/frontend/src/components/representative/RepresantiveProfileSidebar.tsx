import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, MessageSquare, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPartyName } from '@/utils/formatPartyName';

const RepresantiveProfileSidebar = () => {
    const { user } = useAuth();

    return (
        <Card className="honor-card mb-6">
            <div className="flex flex-col items-center p-6">
                <Avatar className="h-24 w-24 mb-4">
                    <User size={48} />
                </Avatar>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-honor-darkGray">{user.representativeProfile.position}</p>
                <div className="flex items-center mt-2">
                    <MapPin
                        size={16}
                        className="text-honor-blue mr-1"
                    />
                    <span className="text-sm">Округ №1</span>
                </div>
                <Badge className="mt-2 bg-honor-blue">{formatPartyName(user.representativeProfile.party)}</Badge>
            </div>

            <div className="border-t border-b py-4 mb-4">
                <div className="grid grid-cols-3 text-center">
                    <div>
                        <p className="text-2xl font-bold text-honor-blue">15</p>
                        <p className="text-xs text-honor-darkGray">Задач</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-honor-blue">8</p>
                        <p className="text-xs text-honor-darkGray">Выполнено</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-honor-blue">4.7</p>
                        <p className="text-xs text-honor-darkGray">Рейтинг</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
                <div className="flex flex-col space-y-3">
                    <Link to="/tasks/create">
                        {/* <Button className="w-full honor-button-primary flex items-center justify-center">
                            <Plus
                                size={18}
                                className="mr-2"
                            />
                            Создать новую задачу
                        </Button> */}
                    </Link>
                    <Link to="/messages">
                        <Button className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-honor-darkGray">
                            <MessageSquare
                                size={18}
                                className="mr-2"
                            />
                            Центр сообщений
                            {/* Display badge if there are unread messages */}
                            {2 > 0 && <Badge className="ml-2 bg-honor-blue">2</Badge>}
                        </Button>
                    </Link>
                    <Link to="/settings">
                        <Button className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-honor-darkGray">
                            <Settings
                                size={18}
                                className="mr-2"
                            />
                            Настройки профиля
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default RepresantiveProfileSidebar;
