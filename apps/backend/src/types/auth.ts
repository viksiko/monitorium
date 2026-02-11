import { User } from './user';

export type JwtPayload = Pick<
    User,
    'id' | 'email' | 'name' | 'phone' | 'role' | 'isRepresentative'
>;
