import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdateTaskStageDto {
    @IsOptional()
    @IsString({ message: 'Индетификато должно быть строкой' })
    @ApiProperty({ example: 'cmik6d2sm0000mojf4oz1jraa' })
    id: string;

    @IsString({ message: 'Заголовок должно быть строкой' })
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @ApiProperty({ example: 'Проверка труб' })
    title: string;

    @IsNotEmpty({ message: 'Дата не может быть пустой' })
    @IsISO8601({}, { message: 'Дата должна быть в формате ISO 8601' })
    @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
    date: string;

    @IsOptional()
    @IsBoolean({ message: 'Поле isCompleted должно быть булевым значением (true/false)' })
    @ApiProperty({ example: 'false' })
    isCompleted: boolean;
}
