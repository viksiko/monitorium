import { createContext, useContext, ReactNode } from 'react';
import {
    useUser,
    useLogin,
    useRegister,
    useLogout,
    useOAuthLogin,
} from '@/hooks/useAuth';
import { User, RegisterData, LoginData, OAuthData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { RegisterRoleEnum } from '@monorepo/types';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<any>;
    logout: () => void;
    loginWithGosuslugi: () => void;
    loginWithSber: () => void;
    loginWithTinkoff: () => void;
    isVerified: () => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { data: user, isLoading: loading } = useUser();
    const queryClient = useQueryClient();
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
            const result = await registerMutation.mutateAsync(data);

            toast({
                title: 'Код подтверждения отправлен',
                description:
                    'Мы отправили код подтверждения на указанный вами email',
                variant: 'success',
            });
            return result;
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            toast({
                title: 'Ошибка регистрации',
                description:
                    error.response?.data?.data.message ||
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

    const refreshUser = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['user'],
        });
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
                refreshUser,
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
