/** Сгенерировано @monorepo/client-generator — не править вручную */

import type { RegisterRoleEnum } from '@monorepo/types';

export enum TokenType {
    REFRESH = 'REFRESH',
    VERIFY_EMAIL = 'VERIFY_EMAIL',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum TaskStatus {
    DELIVERED = 'DELIVERED',
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
}

export interface TokenModel {
    id: string;
    userId: string;
    type: TokenType;
    hashedToken: string;
    device?: string | null;
    ip?: string | null;
    exp: Date;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
}

export interface RepresentativeProfileModel {
    id: string;
    userId: string;
    position: string;
    party?: string | null;
    bio?: string | null;
    rating: number;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number;
    lastActivity?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
    subscribers?: SubscriptionModel[];
}

export interface SubscriptionModel {
    id: string;
    userProfileId: string;
    representativeId: string;
    createdAt: Date;
    voterProfile?: VoterProfileModel;
    representativeProfile?: RepresentativeProfileModel;
}

export interface VoterProfileModel {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
    subscriptions?: SubscriptionModel[];
}

export interface TaskStageModel {
    id: string;
    taskId: string;
    title: string;
    date: Date;
    createdAt: Date;
    task?: TaskModel;
}

export interface TaskCommentModel {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: Date;
    task?: TaskModel;
    user?: UserModel;
}

export interface TaskFileModel {
    id: string;
    taskId: string;
    url: string;
    name?: string | null;
    type?: string | null;
    size?: number | null;
    createdAt: Date;
    task?: TaskModel;
}

export interface TaskModel {
    id: string;
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string | null;
    desiredResolutionDate?: Date | null;
    userId: string;
    status: TaskStatus;
    likesCount: number;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
    stages?: TaskStageModel[];
    comments?: TaskCommentModel[];
    taskFiles?: TaskFileModel[];
}

export interface UserModel {
    id: string;
    name: string;
    email: string;
    password?: string | null;
    phone?: string | null;
    district?: string | null;
    role: unknown;
    gosuslugiId?: string | null;
    sberId?: string | null;
    tinkoffId?: string | null;
    isRepresentative: boolean;
    isVerified: boolean;
    isActive: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tokens?: TokenModel[];
    voterProfile?: VoterProfileModel | null;
    representativeProfile?: RepresentativeProfileModel | null;
    tasks?: TaskModel[];
    taskComments?: TaskCommentModel[];
}

export interface RegisterDtoModel {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: RegisterRoleEnum;
}

export interface ConfirmRegistrationModel {
    userId: string;
    code: string;
}

export interface RepresentativeRequestDtoModel {
    userId: string;
    position: string;
    party?: string;
    districtId?: string;
    bio?: string;
    idCard?: string;
}

export interface LoginDtoModel {
    email: string;
    password: string;
}

export interface ForgotPasswordDtoModel {
    email: string;
}

export interface ResetPasswordDtoModel {
    token: string;
    password: string;
}

export interface CreateCommentDtoModel {
    content: string;
    postId?: string | null;
    taskId?: string | null;
}

export interface GetCommentsDtoModel {
    postId?: string | null;
    taskId?: string | null;
}

export interface EditCommentDtoModel {
    id: string;
    content: string;
}

export interface DeleteCommentDtoModel {
    id: string;
}

export interface CreateDialogDtoModel {
    representativeId: string;
    text: string;
}

export interface CreateMessageDtoModel {
    text: string;
}

export interface GetMessagesDtoModel {
    afterId?: string;
}

export interface CreatePostDtoModel {
    title: string;
    content: string;
    publishedAt?: string;
}

export interface SubscribeDtoModel {
    representativeId: string;
}

export interface CreateTaskStageDtoModel {
    title: string;
    date: string;
}

export interface CreateTaskDtoModel {
    title: string;
    address: string;
    problemDescription: string;
    possibleSolutions?: string;
    desiredResolutionDate?: Date;
    assigneeId?: string;
    stages?: CreateTaskStageDtoModel[];
}

export interface TasksFilterDtoModel {
    districtId?: string;
}

export interface UpdateTaskStageDtoModel {
    id: string;
    title: string;
    date: string;
    isCompleted: boolean;
}

export interface UpdateTaskDtoModel {
    desiredResolutionDate: string;
    possibleSolutions: string;
    status: unknown;
    stages?: UpdateTaskStageDtoModel[];
    deletedStageIds?: string[];
}

export interface DistrictModel {
    id: string;
    name: string;
}

export interface RepresentativeProfileDtoModel {
    id: string;
    position: string;
    party: string | null;
    bio: string | null;
    rating: number;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number;
    lastActivity: Date | null;
}

export interface UserWithRepresentativeProfileDtoModel {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    district: DistrictModel | null;
    isVerified: boolean;
    representativeProfile: RepresentativeProfileDtoModel | null;
}

export interface VoterProfileDtoModel {
    id: string;
    userId: string;
}

export interface UserWithVoterProfileDtoModel {
    id: string;
    name: string;
    email: string;
    district: DistrictModel | null;
    isVerified: boolean;
    voterProfile: VoterProfileDtoModel | null;
}

export interface UsersFilterDtoModel {
    role?: unknown;
    districtId?: string;
}

export interface UserResponseModel {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: unknown;
    isRepresentative: boolean;
    isVerified: boolean;
    isActive: boolean;
    representativeProfile?: {
        id: string;
        position: string;
        party: string | null;
        bio?: string | null;
        rating: number;
        tasksTotal: number;
        tasksCompleted: number;
        attendance: number;
        lastActivity: Date | null;
    } | null;
    voterProfile?: {
        id: string;
        // balance: number;
    } | null;
    subscriptions: Array<{
        id: string;
        createdAt: Date;
        representative: {
            id: string;
            name: string;
            representativeProfile: {
                id: string;
                position: string;
                party: string | null;
                rating: number;
            } | null;
        };
    }>;
}
