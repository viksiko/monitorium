import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UsersFilterDto {
    @IsOptional()
    @IsEnum(['voter', 'representative'], { message: 'Указана недопустимая роль' })
    @ApiPropertyOptional({ type: String, nullable: true, enum: ['voter', 'representative'] })
    role?: 'voter' | 'representative';

    @IsOptional()
    @ApiPropertyOptional({ type: String, nullable: true, description: 'ID округа' })
    districtId?: string;
}
