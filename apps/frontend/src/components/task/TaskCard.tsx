// components/TaskCard.tsx

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { TaskListItem } from '@monorepo/types';
import { TaskStatusBadge } from '../ui/task-status-badge';

type Props = {
    task: TaskListItem;
};

const TaskCard = ({ task }: Props) => {
    return (
        <Link to={`/tasks/${task.id}`}>
            <Card className="honor-card mb-4 hover:shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{task.title}</h3>
                    <TaskStatusBadge status={task.status} />
                </div>

                <div className="flex justify-between items-start">
                    <div className="flex items-center text-honor-darkGray text-sm mb-4">
                        <div className="flex items-center">
                            <User
                                size={16}
                                className="mr-1"
                            />
                            <span>{task.assignee.name}</span>
                        </div>
                        <span className="mx-2">•</span>
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
                        <span>До {new Date(task.desiredResolutionDate).toLocaleDateString('ru-RU')}</span>
                    </div>

                    <Button
                        variant="link"
                        className="p-0 h-auto text-honor-blue">
                        Подробнее
                    </Button>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex space-x-4">
                        <div className="flex items-center space-x-1 text-honor-darkGray">
                            <ThumbsUp size={18} />
                            <span>{task.likesCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-honor-darkGray">
                            <MessageSquare size={18} />
                            <span>{task.comments?.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {/* {task.status !== 'NEW' &&
                                               needsEscalation(task.lastResponseDays) && (
                                                   <Button
                                                       variant="ghost"
                                                       className="text-amber-600 flex items-center mr-2 hover:bg-amber-50"
                                                       onClick={() =>
                                                           setEscalatingTask({
                                                               id: task.id,
                                                               title: task.title,
                                                           })
                                                       }>
                                                       <AlertTriangle
                                                           size={16}
                                                           className="mr-1"
                                                       />
                                                       Эскалировать
                                                   </Button>
                                               )} */}
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-honor-darkGray">
                                <Clock
                                    size={16}
                                    className="inline mr-1"
                                />
                                Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default TaskCard;
