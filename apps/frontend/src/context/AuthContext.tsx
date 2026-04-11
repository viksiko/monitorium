import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUser, useLogin, useRegister, useLogout, useOAuthLogin, useRefreshToken } from '@/hooks/useAuth';
import { User, RegisterData, LoginData, OAuthData } from '@monorepo/types';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { RegisterRoleEnum } from '@monorepo/types';
import { useAuthStore } from '@/shared/stores/auth.store';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const refreshTokenMutation = useRefreshToken();
    const { status } = useAuthStore();
    const { data: user, isLoading: loading } = useUser();
    const queryClient = useQueryClient();
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const oauthMutation = useOAuthLogin();
    const logoutMutation = useLogout();
    const { toast } = useToast();

    // Используем для первоначального запроса токена при загрузке страницы.
    useEffect(() => {
        refreshTokenMutation.mutate();
    }, []);

    // Этот useEffect используется для очистки данных пользователя из кэша, если статус не fresh. Возможно надо удалить это.
    useEffect(() => {
        if (status !== 'fresh') {
            queryClient.removeQueries({ queryKey: ['user'] });
        }
    }, [status, queryClient]);

    const login = async (email: string, password: string) => {
        try {
            await loginMutation.mutateAsync({ email, password });
            toast({
                title: 'Вход выполнен!',
                description: 'Вы успешно вошли в систему.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Ошибка входа',
                description: error.response?.data?.message || 'Неверный email или пароль.',
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
                description: 'Мы отправили код подтверждения на указанный вами email',
                variant: 'success',
            });
            return result;
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            toast({
                title: 'Ошибка регистрации',
                description: error.response?.data?.data.message || 'Произошла ошибка при регистрации.',
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
        await queryClient.refetchQueries({
            queryKey: ['user'],
        });
    };

    return (
        <AuthContext.Provider
            value={{
                // Это условие необходимо для обновления данных пользователя в компонентах.
                user: status === 'fresh' ? user : undefined,
                loading,
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
    const auth = useContext(AuthContext);
    if (auth === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return auth;
};
