/** @generated */

import type { DistrictModel } from './DistrictModel';
import type { RepresentativeProfileDtoModel } from './RepresentativeProfileDtoModel';

export interface UserWithRepresentativeProfileDtoModel {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    district: DistrictModel | null;
    isVerified: boolean;
    representativeProfile: RepresentativeProfileDtoModel | null;
}
