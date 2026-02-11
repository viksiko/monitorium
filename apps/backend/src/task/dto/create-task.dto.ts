import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { CreateTaskStageDto } from './create-task-stage.dto';

export class CreateTaskDto {
    @IsString({ message: 'Заголовок должно быть строкой' })
    @MinLength(2, { message: 'Заголовок должно быть не менее 2 символов' })
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @ApiProperty({ example: 'Утечка воды в подъезде' })
    title: string;

    @IsString({ message: 'Адрес должно быть строкой' })
    @MinLength(2, { message: 'Адрес должно быть не менее 2 символов' })
    @IsNotEmpty({ message: 'Адрес не может быть пустым' })
    @ApiProperty({ example: 'ул. Ленина, д. 10, кв. 5' })
    address: string;

    @IsString({ message: 'Описание должно быть строкой' })
    @MinLength(2, { message: 'Описание должно быть не менее 2 символов' })
    @IsNotEmpty({ message: 'Описание не может быть пустым' })
    @ApiProperty({
        example:
            'Протекает труба на втором этаже, вода капает на лестничную площадку',
    })
    problemDescription: string;

    @IsOptional()
    @IsString({ message: 'Пути решения должны быть строкой' })
    @ApiProperty({
        example:
            'Необходимо заменить участок трубы или установить запорную арматуру',
    })
    possibleSolutions?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Желаемая дата решения должно быть датой' })
    @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
    desiredResolutionDate?: Date;

    @IsOptional()
    @IsArray({ message: 'Этапы должны быть массивом' })
    @ValidateNested({ each: true })
    @Type(() => CreateTaskStageDto)
    @ApiProperty({
        type: [CreateTaskStageDto],
        required: false,
    })
    stages?: CreateTaskStageDto[];

    @IsOptional()
    assigneeId?: string;
}
