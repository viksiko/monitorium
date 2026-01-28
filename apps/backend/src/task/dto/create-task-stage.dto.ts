import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskStageDto {
    @IsString({ message: 'Заголовок должно быть строкой' })
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @ApiProperty({ example: 'Проверка труб' })
    title: string;

    @IsNotEmpty({ message: 'Дата не может быть пустой' })
    @IsISO8601({}, { message: 'Дата должна быть в формате ISO 8601' })
    @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
    date: string;
}
