import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Calendar, TrendingUp, User, Building2 } from 'lucide-react';
import { Representative, Task } from '@monorepo/types';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { constants } from 'buffer';
import Loader from '../ui/loader';

interface DistrictCardProps {
    district: any;
    onDistrictSelect: (name: string | null) => void;
    onSubscribe: (id: number) => void;
    onSelectRepresentative?: (rep: Representative) => void;
}

const DistrictCard = ({ district, onDistrictSelect, onSubscribe, onSelectRepresentative }: DistrictCardProps) => {
    const [representatives, setRepresentatives] = useState<Representative[]>([]);
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const stats = getTasksStats(tasks);

    useEffect(() => {
        if (!district?.name) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setTasksLoading(true);

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
                setTasksLoading(false);
            }
        };

        fetchData();
    }, [district?.name]);

    function getTasksStats(tasks: Task[]) {
        const result = tasks.reduce(
            (acc, task) => {
                switch (task.status) {
                    case 'COMPLETED':
                        acc.completed++;
                        break;
                    case 'REJECTED':
                        acc.rejected++;
                        break;
                    default:
                        acc.inProgress++;
                        break;
                }
                return acc;
            },
            {
                completed: 0,
                inProgress: 0,
                rejected: 0,
                total: tasks.length,
            },
        );

        const satisfactionRate = result.total ? Math.round((result.completed / result.total) * 100) : 0;

        return {
            ...result,
            satisfactionRate,
        };
    }

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
                            <li
                                className="flex items-center gap-1"
                                key={index}>
                                <Building2 size={14} />
                                {area}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/*<div className="mb-4">
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
            </div>*/}

            {/* <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Задачи округа</h3>

                {tasksLoading ? (
                    <p>Загрузка задач...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-gray-500">Нет задач</p>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="p-3 border rounded-xl hover:bg-honor-gray transition-colors">
                                <p className="font-medium">{task.title}</p>

                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin size={14} />
                                    {task.address}
                                </p>

                                <p className="text-xs text-gray-400">Статус: {task.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div> */}

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-honor-blue"></div>
                    <span className="ml-2 text-honor-darkGray">Загрузка данных...</span>
                </div>
            ) : (
                <>
                    {/* Блок статистики */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Статистика округа</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-honor-gray p-3 rounded-lg">
                            <p className="text-xs text-honor-darkGray">Заданий выполнено</p>
                            <p className="font-bold text-honor-blue text-xl">
                                {stats.completed}/{stats.total}
                            </p>
                        </div>
                        <div className="bg-honor-gray p-3 rounded-lg">
                            <p className="text-xs text-honor-darkGray">Удовлетворенность</p>
                            <p className="font-bold text-honor-blue text-xl">{stats.satisfactionRate}%</p>
                        </div>
                    </div>

                    {/* Блок представителей */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Представители округа</h3>

                        {representatives.length === 0 ? (
                            <p className="text-gray-500">Нет представителей</p>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {representatives.map((rep: Representative) => (
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
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

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
