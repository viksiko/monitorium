/** @generated */

import type { RepresentativeProfileModel } from './RepresentativeProfileModel';
import type { VoterProfileModel } from './VoterProfileModel';

export interface SubscriptionModel {
    id: string;
    userProfileId: string;
    representativeId: string;
    createdAt: Date;
    voterProfile?: VoterProfileModel;
    representativeProfile?: RepresentativeProfileModel;
}
