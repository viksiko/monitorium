import React, { createContext, useContext, ReactNode } from 'react';
import {
    useUser,
    useLogin,
    useRegister,
    useLogout,
    useOAuthLogin,
} from '@/hooks/useAuth';
import { User, RegisterData, LoginData, OAuthData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    loginWithGosuslugi: () => void;
    loginWithSber: () => void;
    loginWithTinkoff: () => void;
    isVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { data: user, isLoading: loading } = useUser();
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const oauthMutation = useOAuthLogin();
    const logoutMutation = useLogout();
    const { toast } = useToast();

    const login = async (email: string, password: string) => {
        try {
            await loginMutation.mutateAsync({ email, password });
            toast({
                title: 'Вход выполнен!',
                description: 'Вы успешно вошли в систему.',
                variant: 'success',
            });
        } catch (error: any) {
            toast({
                title: 'Ошибка входа',
                description:
                    error.response?.data?.message ||
                    'Неверный email или пароль.',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            await registerMutation.mutateAsync(data);
            toast({
                title: 'Регистрация успешна!',
                description:
                    'Пожалуйста, проверьте вашу электронную почту для получения ссылки подтверждения.',
                variant: 'success',
            });
        } catch (error: any) {
            toast({
                title: 'Ошибка регистрации',
                description:
                    error.response?.data?.message ||
                    'Произошла ошибка при регистрации.',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const loginWithGosuslugi = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Госуслуги
        // Пока что заглушка
        toast({
            title: 'OAuth Госуслуги',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const loginWithSber = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Сбер ID
        toast({
            title: 'OAuth Сбер ID',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const loginWithTinkoff = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Тинькофф ID
        toast({
            title: 'OAuth Тинькофф ID',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const logout = () => {
        logoutMutation.mutate();
        toast({
            title: 'Выход выполнен',
            description: 'Вы вышли из системы.',
            variant: 'default',
        });
    };

    const isVerified = () => {
        return user?.verified || false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                loginWithGosuslugi,
                loginWithSber,
                loginWithTinkoff,
                isVerified,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
