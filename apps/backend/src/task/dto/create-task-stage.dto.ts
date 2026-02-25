import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskStageDto {
    @IsString({ message: 'Заголовок должно быть строкой' })
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @ApiProperty({ example: 'Осмотр крыши' })
    title: string;

    @IsNotEmpty({ message: 'Дата не может быть пустой' })
    @IsISO8601({}, { message: 'Дата должна быть в формате ISO 8601' })
    @ApiProperty({ example: '2026-01-21T10:30:15.000Z' })
    date: string;
}
