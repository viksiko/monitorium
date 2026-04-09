/** @generated */

import type { DistrictModel } from './DistrictModel';
import type { VoterProfileDtoModel } from './VoterProfileDtoModel';

export interface UserWithVoterProfileDtoModel {
    id: string;
    name: string;
    email: string;
    district: DistrictModel | null;
    isVerified: boolean;
    voterProfile: VoterProfileDtoModel | null;
}
