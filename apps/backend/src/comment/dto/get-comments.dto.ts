import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetCommentsDto {
    @IsOptional()
    @IsString({ message: 'ID поста должен быть строкой' })
    @ApiPropertyOptional({
        type: String,
        nullable: true,
        description: 'ID поста',
        example: 'cmm8ak4c5000ddsjf7hhizpj2',
    })
    postId?: string | null;

    @IsOptional()
    @IsString({ message: 'ID задачи должен быть строкой' })
    @ApiPropertyOptional({
        type: String,
        nullable: true,
        description: 'ID задачи',
        example: 'cmm8ak4c5000ddsjf7hhizpj2',
    })
    taskId?: string | null;
}

export function validateGetCommentsDto(dto: GetCommentsDto): void {
    if (dto.postId && dto.taskId) {
        throw new BadRequestException('Одновременно не может быть указан ID поста и ID задачи.');
    }
}
