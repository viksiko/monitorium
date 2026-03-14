import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    MapPin,
    Calendar,
    Plus,
    X,
    BookOpenText,
    ClipboardCheck,
    NotebookPen,
    Lightbulb,
    BookType,
    User,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useForm } from 'react-hook-form';
import { createTaskSchema } from '@/zod/createTask.shema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormError, formInputClass } from '@/components/ui/formInputClass';
import { add } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const TaskCreate = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const { toast } = useToast();
    const [stages, setStages] = useState([{ title: '', date: '' }]);
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: '',
            address: '',
            description: '',
            solution: '',
            endDate: '',
        },
    });

    const handleStageChange = (index: number, field: string, value: string) => {
        const updatedStages = [...stages];
        updatedStages[index] = { ...updatedStages[index], [field]: value };
        setStages(updatedStages);
    };

    const addStage = () => {
        setStages([...stages, { title: '', date: '' }]);
    };

    const removeStage = (index: number) => {
        if (stages.length > 1) {
            const updatedStages = [...stages];
            updatedStages.splice(index, 1);
            setStages(updatedStages);
        }
    };

    const onSubmit = async (data) => {
        const payload = {
            title: data.title,
            address: data.address,
            problemDescription: data.description,
            possibleSolutions: data.solution,
            desiredResolutionDate: new Date(data.endDate).toISOString(),
            stages:
                data.stages?.map((stage) => ({
                    title: stage.title,
                    date: new Date(stage.date).toISOString(),
                })) || [],

            assigneeId: user.subscriptions?.[0].representative.id, // берем первого представителя из подписок
        };

        try {
            await api.post('/api/v1/tasks', payload);

            toast({
                title: 'Задание создано',
                description: 'Ваше задание успешно отправлено',
                variant: 'success',
            });

            // очистка формы
            reset();
            setStages([{ title: '', date: '' }]);
        } catch (error) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось создать задание',
                variant: 'destructive',
            });
        }

        // toast({
        //     title: 'Требуется оплата',
        //     description: 'Для создания задания требуется 10 билетов',
        //     variant: 'default',
        // });
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">Создание задания</h1>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="honor-card">
                        <div className="mb-6">
                            <Label
                                htmlFor="title"
                                className="block mb-2">
                                Заголовок задания
                            </Label>
                            <div className="relative">
                                <BookType
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    id="title"
                                    name="title"
                                    {...register('title')}
                                    className={formInputClass(errors.title)}
                                    placeholder="Например: Ремонт дороги на ул. Ленина"
                                />
                                <FormError error={errors.title} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label
                                htmlFor="address"
                                className="block mb-2">
                                Адрес
                            </Label>
                            <div className="relative">
                                <MapPin
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    id="address"
                                    name="address"
                                    {...register('address')}
                                    className={formInputClass(errors.address)}
                                    placeholder="Укажите точный адрес проблемы"
                                />
                                <FormError error={errors.address} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label
                                htmlFor="description"
                                className="block mb-2">
                                Описание проблемы
                            </Label>
                            <div className="relative">
                                <NotebookPen
                                    className="absolute left-3 top-5 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Textarea
                                    id="description"
                                    name="description"
                                    {...register('description')}
                                    className={formInputClass(errors.description)}
                                    // className="honor-input min-h-[100px]"
                                    placeholder="Подробно опишите суть проблемы..."
                                />
                                <FormError error={errors.description} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label
                                htmlFor="solution"
                                className="block mb-2">
                                Возможные пути решения
                            </Label>
                            <div className="relative">
                                <Lightbulb
                                    className="absolute left-3 top-5 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Textarea
                                    id="solution"
                                    name="solution"
                                    {...register('solution')}
                                    className="honor-input pl-10"
                                    placeholder="Опишите возможные варианты решения проблемы..."
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label
                                htmlFor="endDate"
                                className="block mb-2">
                                Желаемая дата решения
                            </Label>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    {...register('endDate')}
                                    // className="honor-input pl-10"
                                    className={formInputClass(errors.description)}
                                />
                                <FormError error={errors.endDate} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <Label>Этапы решения</Label>
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

                            {stages.map((stage, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 mb-3">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <ClipboardCheck
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                                size={18}
                                            />
                                            <Input
                                                value={stage.title}
                                                onChange={(e) => handleStageChange(index, 'title', e.target.value)}
                                                className="honor-input pl-10"
                                                placeholder="Название этапа"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-40">
                                        <Input
                                            type="date"
                                            value={stage.date}
                                            onChange={(e) => handleStageChange(index, 'date', e.target.value)}
                                            className="honor-input"
                                        />
                                    </div>
                                    {stages.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeStage(index)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-honor-darkGray hover:text-red-500">
                                            <X size={18} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <Label className="block mb-2">Приложенные файлы</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-honor-darkGray mb-2">Перетащите файлы сюда или нажмите для выбора</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-honor-blue">
                                    Выбрать файлы
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full honor-button-primary">
                            Создать задание (10 билетов)
                        </Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default TaskCreate;
