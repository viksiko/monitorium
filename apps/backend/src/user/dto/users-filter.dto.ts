import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UsersFilterDto {
    @IsOptional()
    @IsEnum(['voter', 'representative'], { message: 'Указана недопустимая роль' })
    @ApiPropertyOptional({ type: String, nullable: true, enum: ['voter', 'representative'] })
    role?: Role;

    @IsOptional()
    @ApiPropertyOptional({ type: String, nullable: true, description: 'ID округа' })
    districtId?: string;
}
