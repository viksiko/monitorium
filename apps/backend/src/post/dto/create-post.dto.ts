import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
    @IsString({ message: 'Заголовок должно быть строкой' })
    @MinLength(2, { message: 'Заголовок должно быть не менее 2 символов' })
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @ApiProperty({ example: 'Отчёт о проделанной работе за январь' })
    title: string;

    @IsString({ message: 'Содержание должно быть строкой' })
    @MinLength(2, { message: 'Содержание должно быть не менее 2 символов' })
    @IsNotEmpty({ message: 'Содержание не может быть пустым' })
    @ApiProperty({ example: 'За январь было выполнено 12 задач, проведено 3 встречи с жителями...' })
    content: string;

    @IsOptional()
    @IsDateString()
    publishedAt?: string;
}
