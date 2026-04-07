/** @generated */

import type { RepresentativeProfileModel } from './RepresentativeProfileModel';
import type { Role } from './Role';
import type { TaskCommentModel } from './TaskCommentModel';
import type { TaskModel } from './TaskModel';
import type { TokenModel } from './TokenModel';
import type { VoterProfileModel } from './VoterProfileModel';

export interface UserModel {
    id: string;
    name: string;
    email: string;
    password?: string | null;
    phone?: string | null;
    district?: string | null;
    role: Role;
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
