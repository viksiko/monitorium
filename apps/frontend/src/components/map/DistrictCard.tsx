import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Calendar, TrendingUp, User } from 'lucide-react';

interface Representative {
    id: number;
    name: string;
    type: string;
    position: string;
    rating: number;
    tasksCompleted: number;
    attendance: number;
}

interface DistrictCardProps {
    district: any;
    onDistrictSelect: (name: string | null) => void;
    onSubscribe: (id: number) => void;
    onSelectRepresentative?: (rep: Representative) => void;
}

const DistrictCard = ({ district, onDistrictSelect, onSubscribe, onSelectRepresentative }: DistrictCardProps) => {
    return (
        <div className="honor-card">
            <div className="flex items-center mb-4">
                <MapPin
                    className="text-honor-blue mr-2"
                    size={24}
                />
                <h2 className="text-2xl font-bold">{district.name}</h2>
            </div>
            {/* <p className="text-honor-darkGray mb-4">{district.description}</p> */}

            {district.areas && (
                <div className="mb-4">
                    <ul className="list-disc list-inside text-honor-darkGray space-y-1">
                        {district.areas.map((area: string, index: number) => (
                            <li key={index}>{area}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Статистика округа</h3>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => onSubscribe(district.id)}>
                    <Bell size={16} />
                    Подписаться
                </Button>
            </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-honor-gray p-3 rounded-lg">
                    <p className="text-xs text-honor-darkGray">Заданий выполнено</p>
                    <p className="font-bold text-honor-blue text-xl">
                        {district.stats.tasksCompleted}/{district.stats.tasksTotal}
                    </p>
                </div>
                <div className="bg-honor-gray p-3 rounded-lg">
                    <p className="text-xs text-honor-darkGray">Удовлетворенность</p>
                    <p className="font-bold text-honor-blue text-xl">{district.stats.satisfactionRate}%</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Предстоящие события</h3>
                    <Link
                        to={`/districts/${district.id}/events`}
                        className="text-sm text-honor-blue hover:underline">
                        Все события
                    </Link>
                </div>
                {district.events.slice(0, 2).map((event) => (
                    <div
                        key={event.id}
                        className="flex items-start gap-2 p-2 border-b last:border-0">
                        <Calendar
                            size={18}
                            className="text-honor-blue mt-1"
                        />
                        <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-honor-darkGray">
                                {event.date} - {event.location}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-semibold mb-2">Представители округа</h3>
            <div className="space-y-3 mb-6">
                {district.representatives.map((rep: Representative) => (
                    <button
                        key={rep.id}
                        onClick={() => onSelectRepresentative && onSelectRepresentative(rep)}
                        className="w-full text-left flex items-center p-3 border rounded-xl hover:bg-honor-gray transition-colors">
                        <div className="bg-honor-gray rounded-full p-2 mr-3">
                            <User
                                size={24}
                                className="text-honor-blue"
                            />
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium">{rep.name}</p>
                            <p className="text-sm text-honor-darkGray">{rep.position}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center text-sm">
                                <TrendingUp
                                    size={14}
                                    className="text-honor-blue"
                                />
                                <span className="ml-1">{rep.rating}</span>
                            </div>
                            <p className="text-xs text-honor-darkGray">{rep.type}</p>
                        </div>
                    </button>
                ))}
            </div> */}

            <div className="flex justify-between">
                <Button
                    className="honor-button-secondary"
                    onClick={() => onDistrictSelect(null)}>
                    Назад к выбору округа
                </Button>
                {/* <Link to={`/districts/${district.id}`}>
                    <Button className="honor-button-primary">Подробнее об округе</Button>
                </Link> */}
            </div>
        </div>
    );
};

export default DistrictCard;
