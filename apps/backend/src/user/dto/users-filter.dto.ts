import { Role } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UsersFilterDto {
    @IsOptional()
    @IsEnum(['voter', 'representative'], { message: 'Указана недопустимая роль' })
    role?: Role;

    @IsOptional()
    districtId?: string;
}
