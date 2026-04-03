import { IsOptional } from 'class-validator';

export class TasksFilterDto {
    @IsOptional()
    district?: string;
}
