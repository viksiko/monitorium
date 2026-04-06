/** @generated */

import type { SubscriptionModel } from './SubscriptionModel';
import type { UserModel } from './UserModel';

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
