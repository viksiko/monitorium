/** @generated */

import type { SubscriptionModel } from './SubscriptionModel';
import type { UserModel } from './UserModel';

export interface VoterProfileModel {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserModel;
    subscriptions?: SubscriptionModel[];
}
