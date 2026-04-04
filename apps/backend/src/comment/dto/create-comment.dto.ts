import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ApiSchema({
    description:
        'Тело запроса для создания комментария. Должен быть задан ровно один из идентификаторов: postId или taskId.',
})
export class CreateCommentDto {
    @IsString({ message: 'Комментарий должен содержать текст' })
    @IsNotEmpty({ message: 'Комментарий не может быть пустым' })
    @ApiProperty({ example: 'Этот пост очень интересный' })
    content: string;

    @IsOptional()
    @IsString({ message: 'ID поста должен быть строкой' })
    @ApiPropertyOptional({ description: 'ID поста', example: 'cmm8ak4c5000ddsjf7hhizpj2' })
    postId?: string | null;

    @IsOptional()
    @IsString({ message: 'ID задачи должен быть строкой' })
    @ApiPropertyOptional({ description: 'ID задачи', example: 'cmm8ak4c5000ddsjf7hhizpj2' })
    taskId?: string | null;
}

export function validateCommentDto(dto: CreateCommentDto): void {
    if (dto.postId && dto.taskId) {
        throw new BadRequestException('Одновременно не может быть указан ID поста и ID задачи.');
    }
}
