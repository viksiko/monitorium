import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/components/ui/use-toast';
import { RepresentativeStep1, VerificationStep, RegisterFooter, RepresentativeDetails } from '@/components/voter';
import GosuslugiAuthButton from '@/components/auth/GosuslugiAuthButton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { RegisterStep1FormValues } from '@/zod/registerStep1.schema';
import { api } from '@/lib/api';
import { RegisterRoleEnum } from '@monorepo/types';
import { Task } from '@monorepo/types';

const RepresentativeRegister = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isRepresentative, setIsRepresentative] = useState(false);
    const [step3FormKey, setStep3FormKey] = useState(0);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        position: '',
        party: '',
        districtId: '',
        bio: '',
        verificationCode: '',
        idCard: null as File | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleSubmitStep1 = async (data: RegisterStep1FormValues) => {
        setIsLoading(true);
        try {
            const response = await register(
                {
                    email: data.email,
                    password: data.password,
                    name: data.fullName,
                    phone: data.phone || undefined,
                    // district: data.district || undefined,
                    role: RegisterRoleEnum.REPRESENTATIVE,
                },
                // RegisterRoleEnum.REPRESENTATIVE,
            );

            // const response = await axios.post('/api/v1/auth/register', {
            //     name: data.fullName,
            //     email: data.email,
            //     password: data.password,
            //     phone: data.phone,
            // });
            // toast({
            //     title: 'Регистрация успешна!',
            //     description: response?.data?.data?.message,
            //     variant: 'success',
            // });

            const { id, isRepresentative } = response.data.data;
            setIsRepresentative(isRepresentative);
            setUserId(id);

            // toast({
            //     title: 'Регистрация успешна!',
            //     description:
            //         'Введите код, отправленный на почту, для подтверждения регистрации',
            //     variant: 'success',
            // });

            setStep(2);

            // navigate('/dashboard');
        } catch (error) {
            // console.error('e', error);
            // toast({
            //     title: 'Ошибка регистрации',
            //     description:
            //         error.response?.data?.data?.message ||
            //         'Произошла ошибка при регистрации.',
            //     variant: 'destructive',
            // });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/auth/confirm-registration', {
                userId,
                code: formData.verificationCode,
            });

            if (isRepresentative) {
                setStep(3); // только депутаты идут дальше
                return;
            } else {
                toast({
                    title: 'Регистрация завершена',
                    description: 'Теперь вы можете войти',
                    variant: 'success',
                });

                navigate('/confirm-registration');
            }

            navigate('/confirm-registration');
        } catch (error) {
            toast({
                title: 'Неверный код подтверждения регистрации',
                description: 'Попробуйте ещё раз',
                variant: 'destructive',
            });
        }
    };

    const handleSubmitStep3 = async (e: React.FormEvent) => {
        setIsLoading(true);
        e.preventDefault();

        // Данные формы, вносимые на 3 шаге
        const step3Data = {
            userId: userId,
            position: formData.position,
            party: formData.party,
            districtId: formData.districtId,
            bio: formData.bio,
            idCard: formData.idCard?.name ?? null,
        };
        console.warn('Данные шага 3 (форма представителя):', step3Data);

        try {
            await api.post('/api/v1/auth/representative-request', step3Data);

            // Сбрасываем данные формы
            setFormData((prev) => ({
                ...prev,
                position: '',
                party: '',
                districtId: '',
                bio: '',
                idCard: null,
            }));
            setStep3FormKey((k) => k + 1);

            toast({
                title: 'Заявка отправлена!',
                description: 'Ваша заявка на регистрацию отправлена и будет рассмотрена в ближайшее время.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Данные не отпавились',
                description: 'Попробуйте ещё раз попозже',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }

        // Редирект на страницу ожидания верификации
        // window.location.href = '/verification-pending';
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">Регистрация представителя власти</h1>

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
                            onSubmit={handleSubmitStep1}
                            isLoading={isLoading}
                        />
                    )}

                    {step === 2 && (
                        <VerificationStep
                            verificationCode={formData.verificationCode}
                            handleChange={handleChange}
                            handleSubmit={handleSubmitStep2}
                            goBack={() => setStep(1)}
                            hasNextStep={isRepresentative}
                        />
                    )}

                    {step === 3 && isRepresentative && (
                        <RepresentativeDetails
                            key={step3FormKey}
                            formData={formData}
                            handleChange={handleChange}
                            handleSelectChange={handleSelectChange}
                            handleFileChange={handleFileChange}
                            handleSubmit={handleSubmitStep3}
                            goBack={() => setStep(2)}
                            isLoading={isLoading}
                        />
                    )}

                    <RegisterFooter />
                </div>
            </div>
        </Layout>
    );
};

export default RepresentativeRegister;
