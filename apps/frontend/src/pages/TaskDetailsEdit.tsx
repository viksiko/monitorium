import { UserProfileSidebar } from '@/components/dashboard';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@monorepo/types';
import {
    Calendar,
    Check,
    CircleChevronLeft,
    Clock,
    Eye,
    MapPin,
    MessageSquare,
    PencilLine,
    Save,
    ThumbsUp,
    Trash2,
    Plus,
    X,
    ChevronLeft,
    LayoutDashboard,
    House,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { useAuthorizedFetch } from '@/hooks/useAuthorizedFetch';
import { TaskStatusBadge } from '@/components/ui/task-status-badge';
import RepresentativeProfile from './RepresentativeProfile';
import { ProfileSidebar } from '@/components/representative';
import { useEffect, useRef, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { TaskStatus, TaskStage } from '@monorepo/types';
import { Button } from '@/components/ui/button';
import { STATUS_CONFIG } from '@/constants/task-status.config';
import DashboardBackButton from '@/components/ui/dashboardBackButton';

const TaskDetailsEdit = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const { data: task, loading, error, request } = useApi<Task>();
    const textareaRef = useRef(null);
    const statusOptions = Object.values(TaskStatus);

    const [isEditingPossibleSolutions, setIsEditingPossibleSolutions] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editingStageTitleId, setEditingStageTitleId] = useState<string | null>(null);
    const [editingStageDateId, setEditingStageDateId] = useState<string | null>(null);
    const [deletedStageIds, setDeletedStageIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const [editedTask, setEditedTask] = useState({
        possibleSolutions: '',
        desiredResolutionDate: '',
        status: null as TaskStatus | null,
        stages: [] as TaskStage[],
    });

    // отвечает за появление кнопки сохранить
    const isChanged = useMemo(() => {
        if (!task) return false;

        return (
            editedTask.possibleSolutions !== task.possibleSolutions ||
            editedTask.desiredResolutionDate !== task.desiredResolutionDate?.slice(0, 10) ||
            editedTask.status !== task.status ||
            JSON.stringify(editedTask.stages) !== JSON.stringify(task.stages) // Для продакшена лучше deep compare, но для начала нормально
        );
    }, [editedTask, task]);

    useEffect(() => {
        if (!taskId) return;

        request({
            method: 'GET',
            url: `/api/v1/tasks/${taskId}`,
        });
    }, [taskId, request]);

    useEffect(() => {
        if (!task) return;

        const d = new Date(task.desiredResolutionDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        setEditedTask({
            possibleSolutions: task.possibleSolutions ?? '',
            desiredResolutionDate: `${yyyy}-${mm}-${dd}`,
            status: task.status,
            stages: task.stages ?? [],
        });
    }, [task]);

    const handleSave = async () => {
        if (!isChanged) return;

        setIsSaving(true);

        try {
            const updatedData: any = {};

            const changedStages = getChangedStages(editedTask.stages, task.stages);

            if (editedTask.possibleSolutions !== task.possibleSolutions)
                updatedData.possibleSolutions = editedTask.possibleSolutions;

            if (editedTask.desiredResolutionDate !== task.desiredResolutionDate?.slice(0, 10))
                updatedData.desiredResolutionDate = editedTask.desiredResolutionDate;

            if (editedTask.status !== task.status) updatedData.status = editedTask.status;

            if (changedStages.length > 0) {
                updatedData.stages = changedStages.map(normalizeStageForApi);
            }

            if (deletedStageIds.length > 0) {
                updatedData.deletedStageIds = deletedStageIds;
            }

            await request({
                method: 'PATCH',
                url: `/api/v1/tasks/${taskId}`,
                data: updatedData,
            });

            // очищаем удаленные этапы
            setDeletedStageIds([]);
        } finally {
            setIsSaving(false);
        }
    };

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    // const handleSave = () => {
    //     setIsEditing(false);
    //     // if (onSave) onSave(value);
    // };

    // const handleCancel = () => {
    //     setValue(task.possibleSolutions);
    //     setIsEditingPossibleSolutions(false);
    // };

    // Изменение title этапа
    const handleStageTitleChange = (id: string, newTitle: string) => {
        setEditedTask((prev) => ({
            ...prev,
            stages: prev.stages.map((stage) => (stage.id === id ? { ...stage, title: newTitle } : stage)),
        }));
    };

    // Изменение даты этапа
    const handleStageDateChange = (id: string, newDate: string) => {
        setEditedTask((prev) => ({
            ...prev,
            stages: prev.stages.map((stage) => (stage.id === id ? { ...stage, date: newDate } : stage)),
        }));
    };

    // Удаление этапа
    const handleDeleteStage = (id: string) => {
        setEditedTask((prev) => ({
            ...prev,
            stages: prev.stages.filter((stage) => stage.id !== id),
        }));

        // если это не временный этап — запоминаем для удаления
        if (!id.startsWith('temp-')) {
            setDeletedStageIds((prev) => [...prev, id]);
        }

        // setDeletedStageIds([]);
    };

    // Функцию сравнения этапов
    const getChangedStages = (edited: any[], original: any[]) => {
        const changed: any[] = [];

        for (const stage of edited) {
            // 👇 нормализуем isCompleted
            const normalizedIsCompleted = stage.isCompleted ?? false;

            // Новый этап
            if (!stage.id || stage.id.startsWith('temp')) {
                changed.push({
                    ...stage,
                    isCompleted: normalizedIsCompleted,
                });
                continue;
            }

            const originalStage = original.find((s) => s.id === stage.id);

            if (!originalStage) {
                changed.push({
                    ...stage,
                    isCompleted: normalizedIsCompleted,
                });
                continue;
            }

            const isDifferent =
                stage.title !== originalStage.title ||
                stage.date?.slice(0, 10) !== originalStage.date?.slice(0, 10) ||
                normalizedIsCompleted !== originalStage.isCompleted;

            if (isDifferent) {
                changed.push({
                    ...stage,
                    isCompleted: normalizedIsCompleted,
                });
            }
        }

        return changed;
    };

    const normalizeStageForApi = (stage: any) => ({
        id: stage.id,
        title: stage.title,
        date: stage.date?.slice(0, 10),
        isCompleted: stage.isCompleted,
    });

    const addStage = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        setEditedTask((prev) => ({
            ...prev,
            stages: [
                ...prev.stages,
                {
                    id: `temp-${Date.now()}-${Math.random()}`,
                    title: 'Название этапа',
                    date: formattedDate,
                },
            ],
        }));
    };

    const handleToggleStageCompleted = (id: string) => {
        setEditedTask((prev) => ({
            ...prev,
            stages: prev.stages.map((stage) =>
                stage.id === id ? { ...stage, isCompleted: !stage.isCompleted } : stage,
            ),
        }));
    };

    function handleLike(arg0: string, id: string): void {
        throw new Error('Function not implemented.');
    }

    if (loading && !task) return <Loader />;

    if (error) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <p className="text-red-500">{error}</p>
                </div>
            </Layout>
        );
    }

    if (!task) {
        return (
            <Layout>
                <div className="honor-container py-12">
                    <p>Задача не найдена</p>
                    <Link to="/tasks">← Вернуться к списку</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold text-honor-darkGray mb-8">Задача «{task.title}»</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ProfileSidebar />
                    </div>
                    <div className="lg:col-span-2">
                        {isSaving && (
                            <div>
                                <Loader />
                            </div>
                        )}
                        <div className="flex relative justify-between">
                            <DashboardBackButton />

                            {isChanged && (
                                <div className="absolute top-[-26px] right-0">
                                    <Save
                                        size={22}
                                        strokeWidth={1.75}
                                        className="text-honor-blue cursor-pointer hover:opacity-80"
                                        onClick={handleSave}
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <Tabs defaultValue="tasks">
                                <TabsContent
                                    value="tasks"
                                    className="space-y-6  mt-0">
                                    <Card
                                        key={task.id}
                                        className="honor-card">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{task.title}</h2>
                                            <div className="relative flex items-center gap-2">
                                                <TaskStatusBadge status={editedTask.status ?? task.status} />

                                                {isEditingStatus && (
                                                    <div className="absolute top-8 left-0 bg-white border rounded shadow-md z-50 min-w-[180px]">
                                                        {statusOptions.map((status) => (
                                                            <div
                                                                key={status}
                                                                onClick={() => {
                                                                    setEditedTask((prev) => ({
                                                                        ...prev,
                                                                        status,
                                                                    }));
                                                                    setIsEditingStatus(false);
                                                                }}
                                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 `}>
                                                                {STATUS_CONFIG[status].label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {!isEditingStatus && (
                                                    <PencilLine
                                                        size={20}
                                                        className="text-honor-blue cursor-pointer"
                                                        onClick={() => setIsEditingStatus(true)}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* {showModifications === task.id &&
                                            task.modificationHistory.length >
                                                0 && (
                                                <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                                    <h3 className="font-semibold mb-2">
                                                        История изменений:
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {task.modificationHistory.map(
                                                            (mod, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="text-honor-darkGray">
                                                                    <span className="font-medium">
                                                                        {new Date(
                                                                            mod.date,
                                                                        ).toLocaleDateString(
                                                                            'ru-RU',
                                                                        )}
                                                                    </span>{' '}
                                                                    - Поле "
                                                                    <span className="italic">
                                                                        {
                                                                            mod.field
                                                                        }
                                                                    </span>
                                                                    " изменено с
                                                                    "
                                                                    <span className="line-through">
                                                                        {
                                                                            mod.oldValue
                                                                        }
                                                                    </span>
                                                                    " на "
                                                                    <span className="font-medium">
                                                                        {
                                                                            mod.newValue
                                                                        }
                                                                    </span>
                                                                    "
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )} */}

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
                                            {isEditingDate ? (
                                                <input
                                                    type="date"
                                                    value={editedTask.desiredResolutionDate}
                                                    onChange={(e) =>
                                                        setEditedTask((prev) => ({
                                                            ...prev,
                                                            desiredResolutionDate: e.target.value,
                                                        }))
                                                    }
                                                    onBlur={() => setIsEditingDate(false)}
                                                    className="border text-sm p-1"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="mr-2">
                                                    До{' '}
                                                    {new Date(editedTask.desiredResolutionDate).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </span>
                                            )}

                                            {!isEditingDate && (
                                                <PencilLine
                                                    size={20}
                                                    className="text-honor-blue cursor-pointer"
                                                    onClick={() => setIsEditingDate(true)}
                                                />
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-honor-darkGray mb-2">{task.problemDescription}</p>

                                            <div className="flex items-start gap-2">
                                                <p className="text-sm font-medium">Решение:</p>

                                                {isEditingPossibleSolutions ? (
                                                    <textarea
                                                        value={editedTask.possibleSolutions}
                                                        onChange={(e) => {
                                                            setEditedTask((prev) => ({
                                                                ...prev,
                                                                possibleSolutions: e.target.value,
                                                            }));
                                                            autoResize();
                                                        }}
                                                        onBlur={() => setIsEditingPossibleSolutions(false)}
                                                        className="border text-sm resize-none overflow-hidden w-full"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <>
                                                        <span className="text-sm whitespace-pre-wrap">
                                                            {editedTask.possibleSolutions}
                                                        </span>
                                                        {!isEditingPossibleSolutions && (
                                                            <PencilLine
                                                                size={20}
                                                                className="text-honor-blue cursor-pointer"
                                                                onClick={() => setIsEditingPossibleSolutions(true)}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold mb-2">Этапы выполнения</h3>
                                                <Button
                                                    type="button"
                                                    onClick={addStage}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center text-honor-blue">
                                                    <Plus
                                                        size={16}
                                                        className="mr-1"
                                                    />
                                                    Добавить этап
                                                </Button>
                                            </div>

                                            {editedTask.stages && editedTask.stages.length > 0 ? (
                                                editedTask.stages.map((stage) => (
                                                    <div
                                                        key={stage.id}
                                                        className="flex items-center mb-2">
                                                        <div
                                                            onClick={() => handleToggleStageCompleted(stage.id)}
                                                            className={`h-4 w-4 flex items-center justify-center rounded-full mr-3 cursor-pointer transition-all ${
                                                                stage.isCompleted
                                                                    ? 'bg-honor-blue'
                                                                    : 'border border-honor-darkGray'
                                                            }`}>
                                                            {stage.isCompleted && (
                                                                <Check
                                                                    size={10}
                                                                    className="text-white"
                                                                />
                                                            )}
                                                        </div>

                                                        <div className="flex w-full justify-between">
                                                            <div className="flex gap-2 items-center">
                                                                <div className="flex gap-2 items-center w-full">
                                                                    {editingStageTitleId === stage.id ? (
                                                                        <textarea
                                                                            value={stage.title}
                                                                            onChange={(e) =>
                                                                                handleStageTitleChange(
                                                                                    stage.id,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            onBlur={() => setEditingStageTitleId(null)}
                                                                            className="border text-sm resize-none overflow-hidden w-full"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-sm whitespace-pre-wrap w-full">
                                                                                {stage.title}
                                                                            </span>

                                                                            <PencilLine
                                                                                size={20}
                                                                                className="text-honor-blue cursor-pointer"
                                                                                onClick={() =>
                                                                                    setEditingStageTitleId(stage.id)
                                                                                }
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-6">
                                                                <div className="flex gap-2 items-center">
                                                                    {editingStageDateId === stage.id ? (
                                                                        <input
                                                                            type="date"
                                                                            value={stage.date?.slice(0, 10)}
                                                                            onChange={(e) =>
                                                                                handleStageDateChange(
                                                                                    stage.id,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            onBlur={() => setEditingStageDateId(null)}
                                                                            className="border text-xs p-1"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-xs text-honor-darkGray">
                                                                                {stage.date
                                                                                    ? new Date(
                                                                                          stage.date,
                                                                                      ).toLocaleDateString('ru-RU')
                                                                                    : '—'}
                                                                            </span>

                                                                            <PencilLine
                                                                                size={20}
                                                                                className="text-honor-blue cursor-pointer"
                                                                                onClick={() =>
                                                                                    setEditingStageDateId(stage.id)
                                                                                }
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <div className="flex gap-1">
                                                                    <X
                                                                        size={20}
                                                                        className="text-honor-blue cursor-pointer"
                                                                        onClick={() => handleDeleteStage(stage.id)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-honor-darkGray italic">Этапов пока нет</p>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t">
                                            <div className="flex space-x-4">
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <ThumbsUp size={18} />
                                                    <span>{task.likesCount}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <MessageSquare size={18} />
                                                    <span>{task.comments}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-honor-darkGray">
                                                    <Eye size={18} />
                                                    <span>{task.viewsCount}</span>
                                                </div>
                                            </div>
                                            {/* <span className="text-sm text-honor-darkGray">
                                                <Clock
                                                    size={16}
                                                    className="inline mr-1"
                                                />
                                                Обновлено 2 дня назад
                                            </span> */}
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
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TaskDetailsEdit;
