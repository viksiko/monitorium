import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/components/ui/use-toast';
import {
    RepresentativeStep1,
    VerificationStep,
    RegisterFooter,
    RepresentativeDetails,
} from '@/components/voter';
import GosuslugiAuthButton from '@/components/auth/GosuslugiAuthButton';
import { Separator } from '@/components/ui/separator';

const RepresentativeRegister = () => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        position: '',
        party: '',
        district: '',
        bio: '',
        verificationCode: '',
        idCard: null as File | null,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({
                ...formData,
                idCard: e.target.files[0],
            });
        } else {
            setFormData({
                ...formData,
                idCard: null,
            });
        }
    };

    const handleSubmitStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        // В реальном приложении здесь был бы запрос на отправку кода верификации
        toast({
            title: 'Код подтверждения отправлен',
            description:
                'Мы отправили код подтверждения на указанный вами номер телефона',
            variant: 'default',
        });
        setStep(2);
    };

    const handleSubmitStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        // В реальном приложении здесь была бы проверка кода верификации
        setStep(3);
    };

    const handleSubmitStep3 = (e: React.FormEvent) => {
        e.preventDefault();
        // В реальном приложении здесь была бы отправка данных о представителе власти
        toast({
            title: 'Заявка отправлена!',
            description:
                'Ваша заявка на регистрацию отправлена и будет рассмотрена в ближайшее время.',
            variant: 'default',
        });
        // Редирект на страницу ожидания верификации
        // window.location.href = '/verification-pending';
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">
                        Регистрация представителя власти
                    </h1>

                    {/* <GosuslugiAuthButton
                        isRepresentative={true}
                        className="mb-6"
                    />

                    <div className="flex items-center my-6">
                        <Separator className="flex-grow" />
                        <span className="px-4 text-sm text-honor-darkGray">
                            или
                        </span>
                        <Separator className="flex-grow" />
                    </div> 

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                        <p className="text-sm text-honor-blue">
                            <strong>Рекомендуем:</strong> Регистрация через
                            Госуслуги значительно упрощает процесс верификации и
                            автоматически подтверждает ваши официальные
                            полномочия.
                        </p>
                    </div> */}

                    {step === 1 && (
                        <RepresentativeStep1
                            formData={formData}
                            handleChange={handleChange}
                            handleSubmit={handleSubmitStep1}
                        />
                    )}

                    {step === 2 && (
                        <VerificationStep
                            verificationCode={formData.verificationCode}
                            handleChange={handleChange}
                            handleSubmit={handleSubmitStep2}
                            goBack={() => setStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <RepresentativeDetails
                            formData={formData}
                            handleChange={handleChange}
                            handleSelectChange={handleSelectChange}
                            handleFileChange={handleFileChange}
                            handleSubmit={handleSubmitStep3}
                            goBack={() => setStep(2)}
                        />
                    )}

                    <RegisterFooter />
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeRegister;
