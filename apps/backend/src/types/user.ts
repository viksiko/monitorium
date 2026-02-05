import { Role as PrismaRole } from '@prisma/client';

export { Role } from '@prisma/client';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string | null;
    phone: string | null;
    district: string | null;
    balance: number;
    isRepresentative: boolean;
    role: PrismaRole;
    gosuslugiId: string | null;
    sberId: string | null;
    tinkoffId: string | null;
    isVerified: boolean;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    representativeProfile?: RepresentativeProfile | null;
}

export interface RepresentativeProfile {
    id: string;
    userId: string;
    position: string;
    party: string | null;
    rating: number;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number;
    lastActivity: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type UserResponse = Pick<User, 'id' | 'name' | 'email' | 'role'>;
