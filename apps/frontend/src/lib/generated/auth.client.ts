/**
 * HTTP-клиент для AuthController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type {
    ConfirmRegistrationModel,
    ForgotPasswordDtoModel,
    LoginDtoModel,
    RegisterDtoModel,
    RepresentativeRequestDtoModel,
    ResetPasswordDtoModel,
    UserModel,
} from './models/index';
import type { UserProfile } from '@monorepo/types';

export const auth = {
    register: async (registerDto: RegisterDtoModel) => {
        return customInstance<UserModel>({
            url: `/api/v1/auth/register`,
            method: 'POST',
            data: registerDto,
        });
    },
    confirmRegistration: async (dto: ConfirmRegistrationModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/auth/confirm-registration`,
            method: 'POST',
            data: dto,
        });
    },
    representativeRequest: async (dto: RepresentativeRequestDtoModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/auth/representative-request`,
            method: 'POST',
            data: dto,
        });
    },
    login: async (loginDto: LoginDtoModel) => {
        return customInstance<{
            accessToken: string;
            userProfile: UserProfile;
        }>({
            url: `/api/v1/auth/login`,
            method: 'POST',
            data: loginDto,
        });
    },
    refresh: async () => {
        return customInstance<{
            accessToken: string;
            userProfile: UserProfile;
        }>({
            url: `/api/v1/auth/refresh`,
            method: 'POST',
        });
    },
    logout: async () => {
        return customInstance<{
            message: string;
        }>({
            url: `/api/v1/auth/logout`,
            method: 'POST',
        });
    },
    forgotPassword: async (forgotPasswordDto: ForgotPasswordDtoModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/auth/forgot-password`,
            method: 'POST',
            data: forgotPasswordDto,
        });
    },
    resetPassword: async (resetPasswordDto: ResetPasswordDtoModel) => {
        return customInstance<{ message: string }>({
            url: `/api/v1/auth/reset-password`,
            method: 'POST',
            data: resetPasswordDto,
        });
    },
} as const;
