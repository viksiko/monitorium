import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdateTaskStageDto } from './update-task-stage.dto';

export class UpdateTaskDto {
    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Желаемая дата решения должно быть датой' })
    @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
    desiredResolutionDate: string;

    @IsOptional()
    @IsString({ message: 'Пути решения должны быть строкой' })
    @ApiProperty({
        example: 'Необходимо заменить участок трубы или установить запорную арматуру',
    })
    possibleSolutions: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    @ApiProperty({
        example: TaskStatus,
    })
    status: TaskStatus;

    @IsOptional()
    @IsArray({ message: 'Этапы должны быть массивом' })
    @ValidateNested({ each: true })
    @Type(() => UpdateTaskStageDto)
    @ApiProperty({
        type: [UpdateTaskStageDto],
        required: false,
    })
    @ApiProperty({
        type: [UpdateTaskStageDto],
    })
    stages?: UpdateTaskStageDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deletedStageIds?: string[];
}
