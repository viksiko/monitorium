import { Role } from '@prisma/client';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string | null;
    phone?: string | null;
    district?: string | null;
    role: Role;

    // OAuth ID
    gosuslugiId?: string | null;
    sberId?: string | null;
    tinkoffId?: string | null;

    // Статусы
    isRepresentative: boolean;
    isVerified: boolean;
    isActive: boolean;
    deletedAt?: Date | null;

    // Таймстампы
    createdAt: Date;
    updatedAt: Date;

    // Отношения
    tokens?: Token[];
    voterProfile?: VoterProfile | null;
    representativeProfile?: RepresentativeProfile | null;
    tasks?: Task[];
    taskComments?: TaskComment[];
}

export interface VoterProfile {
    id: string;
    userId: string;
    balance: number;

    // Таймстампы
    createdAt: Date;
    updatedAt: Date;

    // Отношения
    user?: User;
    subscriptions?: Subscription[];
}

// export type UserResponse = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface RepresentativeProfile {
    id: string;
    userId: string;
    position: string;
    party?: string | null;
    bio?: string | null;

    // Статистика
    rating: number;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number;
    lastActivity?: Date | null;

    // Таймстампы
    createdAt: Date;
    updatedAt: Date;

    // Отношения
    user?: User;
    subscribers?: Subscription[];
}

export interface Subscription {
    id: string;
    userProfileId: string;
    representativeId: string;
    createdAt: Date;

    // Отношения
    voterProfile?: VoterProfile;
    representativeProfile?: RepresentativeProfile;
}

export interface Token {
    id: string;
    userId: string;
    type: TokenType;
    hashedToken: string;
    device?: string | null;
    ip?: string | null;
    exp: Date;
    createdAt: Date;
    updatedAt: Date;

    // Отношения
    user?: User;
}

export interface Task {
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

    // Task
    user?: User;
    stages?: TaskStage[];
    comments?: TaskComment[];
    taskFiles?: TaskFile[];
}

export interface TaskStage {
    id: string;
    taskId: string;
    title: string;
    date: Date;
    createdAt: Date;

    // Отношения
    task?: Task;
}

export interface TaskFile {
    id: string;
    taskId: string;
    url: string;
    name?: string | null;
    type?: string | null;
    size?: number | null;
    createdAt: Date;

    // Отношения
    task?: Task;
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: Date;

    // Relations
    task?: Task;
    user?: User;
}

/*ENUMS*/

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

export interface RepresentativeProfileDto {
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

export interface UserWithRepresentativeProfileDto {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    district: District | null;
    isVerified: boolean;
    representativeProfile: RepresentativeProfileDto | null;
}

export interface VoterProfileDto {
    id: string;
    userId: string;
}

export interface UserWithVoterProfileDto {
    id: string;
    name: string;
    email: string;
    district: District | null;
    isVerified: boolean;
    voterProfile: VoterProfileDto | null;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
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

interface District {
    id: string;
    name: string;
}
