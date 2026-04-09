/** @generated */

import type { TokenType } from './TokenType';
import type { UserModel } from './UserModel';

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
