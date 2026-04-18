import React from 'react';
import Layout from '@/components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, Video, FileText } from 'lucide-react';

const Help: React.FC = () => {
    const faqItems = [
        {
            question: 'Как зарегистрироваться на платформе?',
            answer: 'Для регистрации на платформе «Мониториум» перейдите на главную страницу и выберите тип учетной записи: «Для избирателей» или «Для представителей власти». Затем заполните регистрационную форму с указанием ваших контактных данных и следуйте инструкциям на экране.',
        },
        {
            question: 'Как создать новое задание?',
            answer: 'Чтобы создать новое задание, войдите в свою учетную запись, перейдите в раздел «Создать задание» и заполните форму с указанием названия, описания, категории и срока выполнения задания. Также вы можете прикрепить необходимые файлы и указать целевого представителя власти.',
        },
        {
            question: 'Как проверить статус моего задания?',
            answer: 'Вы можете проверить статус своего задания, перейдя в раздел «Мои задания» в личном кабинете. Там вы увидите список всех созданных вами заданий с указанием их текущего статуса, комментариев от представителей власти и сроков выполнения.',
        },
        {
            question: 'Как связаться с представителем власти?',
            answer: 'Для связи с представителем власти вы можете использовать встроенную систему сообщений платформы. Откройте профиль нужного представителя и нажмите на кнопку «Отправить сообщение». Также вы можете оставить комментарий к существующему заданию или создать новое задание, адресованное конкретному представителю.',
        },
        {
            question: 'Что делать, если представитель не отвечает на мое задание?',
            answer: 'Если представитель власти не отвечает на ваше задание в течение длительного времени, вы можете использовать функцию «Эскалация». Для этого откройте задание и нажмите на кнопку «Эскалировать». После этого администрация платформы будет уведомлена о проблеме и примет необходимые меры.',
        },
        {
            question: 'Как я могу оценить работу представителя власти?',
            answer: 'После выполнения задания вы можете оценить работу представителя власти, поставив оценку от 1 до 5 звезд и оставив отзыв. Эта информация будет отображаться в профиле представителя и влиять на его общий рейтинг на платформе.',
        },
    ];

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold mb-2">Помощь и поддержка</h1>
                <p className="text-honor-darkGray mb-8">
                    Здесь вы найдете ответы на часто задаваемые вопросы и инструкции по работе с платформой «Мониториум»
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="p-6 mb-8">
                            <h2 className="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full">
                                {faqItems.map((item, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`item-${index}`}>
                                        <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                                        <AccordionContent>{item.answer}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Card>

                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Видеоинструкции</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 aspect-video flex items-center justify-center">
                                        <Video
                                            className="text-honor-blue"
                                            size={48}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-1">Знакомство с платформой</h3>
                                        <p className="text-sm text-honor-darkGray">
                                            Обзор основных функций и возможностей
                                        </p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 aspect-video flex items-center justify-center">
                                        <Video
                                            className="text-honor-blue"
                                            size={48}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-1">Создание заданий</h3>
                                        <p className="text-sm text-honor-darkGray">
                                            Пошаговая инструкция по созданию заданий
                                        </p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 aspect-video flex items-center justify-center">
                                        <Video
                                            className="text-honor-blue"
                                            size={48}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-1">Работа с картой округов</h3>
                                        <p className="text-sm text-honor-darkGray">Поиск и фильтрация на карте</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 aspect-video flex items-center justify-center">
                                        <Video
                                            className="text-honor-blue"
                                            size={48}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-1">Система сообщений</h3>
                                        <p className="text-sm text-honor-darkGray">Общение с представителями власти</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <HelpCircle
                                    className="mr-2"
                                    size={20}
                                />
                                Нужна помощь?
                            </h3>
                            <p className="text-honor-darkGray mb-4">
                                Если вы не нашли ответа на свой вопрос, свяжитесь с нашей службой поддержки
                            </p>
                            <Link to="/messages">
                                <Button className="w-full honor-button-primary mb-2 flex items-center justify-center">
                                    <MessageSquare
                                        className="mr-2"
                                        size={18}
                                    />
                                    Написать в поддержку
                                </Button>
                            </Link>
                            <div className="text-center text-sm text-honor-darkGray mt-2">
                                Среднее время ответа: 2 часа
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <FileText
                                    className="mr-2"
                                    size={20}
                                />
                                Документация
                            </h3>
                            <ul className="space-y-2">
                                <li className="p-2 hover:bg-honor-gray rounded transition-colors">
                                    <Link
                                        to="#"
                                        className="flex justify-between items-center">
                                        <span>Руководство пользователя</span>
                                        <span className="text-xs bg-honor-gray px-2 py-1 rounded">PDF</span>
                                    </Link>
                                </li>
                                <li className="p-2 hover:bg-honor-gray rounded transition-colors">
                                    <Link
                                        to="#"
                                        className="flex justify-between items-center">
                                        <span>Правила платформы</span>
                                        <span className="text-xs bg-honor-gray px-2 py-1 rounded">PDF</span>
                                    </Link>
                                </li>
                                <li className="p-2 hover:bg-honor-gray rounded transition-colors">
                                    <Link
                                        to="#"
                                        className="flex justify-between items-center">
                                        <span>Политика конфиденциальности</span>
                                        <span className="text-xs bg-honor-gray px-2 py-1 rounded">PDF</span>
                                    </Link>
                                </li>
                                <li className="p-2 hover:bg-honor-gray rounded transition-colors">
                                    <Link
                                        to="#"
                                        className="flex justify-between items-center">
                                        <span>Инструкция для представителей</span>
                                        <span className="text-xs bg-honor-gray px-2 py-1 rounded">PDF</span>
                                    </Link>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Help;
