import { TaskListItem } from '@monorepo/types';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Task, TaskStage, User } from '@prisma/client';
import { AdminGuard } from '@src/auth/guards/admin.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_TASK_ID, PARAM_TASK_ID_STAGE } from '@src/constants/swagger/api-param.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import {
    CREATE_TASK_STAGES_SUCCESS_RESPONSE,
    CREATE_TASK_STAGES_VALIDATION_ERROR_RESPONSE,
    CREATE_TASK_SUCCESS_RESPONSE,
    CREATE_TASK_VALIDATION_ERROR_RESPONSE,
    GET_ALL_TASKS_BY_USER,
    GET_ALL_TASKS_SUCCESS_RESPONSE,
    GET_TASK_BY_ID,
    GET_TASK_STAGES_BY_TASK,
    NO_TASK_ACCESS_RESPONSE,
    TASK_DELETE_SUCCESS_RESPONSE,
    TASK_NOT_FOUND_RESPONSE,
} from '@src/constants/swagger/task-responses.swagger';
import { CreateTaskStageDto } from './dto/create-task-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'tasks',
    version: '1',
})
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    // Создание новой задачи
    @Post()
    @ApiOperation({ summary: 'Создать новое задание' })
    @ApiResponse(CREATE_TASK_SUCCESS_RESPONSE)
    @ApiResponse(CREATE_TASK_VALIDATION_ERROR_RESPONSE)
    async createTask(@Req() req: Request & { user: User }, @Body() dto: CreateTaskDto): Promise<Task> {
        return await this.taskService.createTask(req.user.id, dto);
    }

    // Получение всех задач (для администраторов)
    @UseGuards(AdminGuard)
    @Get()
    @ApiOperation({
        summary: 'Получить все задания (требуются права администратора)',
    })
    @ApiResponse(GET_ALL_TASKS_SUCCESS_RESPONSE)
    findAll(): Promise<Task[]> {
        return this.taskService.findAll();
    }

    // Получение всех задач избирателя или представителя власти
    @Get('user-tasks')
    @ApiOperation({
        summary: '  Получить задания избирателя или представителя власти в зависимости от роли',
    })
    @ApiResponse(GET_ALL_TASKS_BY_USER)
    async getTasksForRepresentative(@Req() req: Request & { user: User }): Promise<TaskListItem[] | null> {
        const user = req.user;
        return await this.taskService.getTasksByUser(user);
    }

    // Получение задания по ID
    @Get(':id')
    @ApiOperation({
        summary: 'Получить задание по ID',
    })
    @ApiResponse(GET_TASK_BY_ID)
    @ApiParam(PARAM_TASK_ID)
    findOneTaskById(@Param('id') id: string): Promise<Task | null> {
        return this.taskService.findOneTaskById(id);
    }

    // // Обновление задания
    // @Patch(':id')
    // @ApiOperation({
    //     summary: 'Обновить данные задачи по указанному идентификатору',
    // })
    // @ApiParam(PARAM_TASK_ID)
    // update(@Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<Task> {
    //     return this.taskService.update(id, dto);
    // }

    // Удаление задания
    @Delete(':id')
    @ApiOperation({
        summary: 'Удалить задачу по ID',
    })
    @ApiParam(PARAM_TASK_ID)
    @ApiResponse(TASK_DELETE_SUCCESS_RESPONSE)
    @ApiResponse(TASK_NOT_FOUND_RESPONSE)
    remove(@Param('id') id: string): Promise<{ message: string }> {
        return this.taskService.remove(id);
    }

    /**Этапы заданий**/
    // Добавление этапа к задаче
    @Post(':taskId/stages')
    @ApiOperation({
        summary: 'Создать новый этап для указанного задания',
    })
    @ApiParam(PARAM_TASK_ID_STAGE)
    @ApiResponse(TASK_NOT_FOUND_RESPONSE)
    @ApiResponse(CREATE_TASK_STAGES_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(CREATE_TASK_STAGES_SUCCESS_RESPONSE)
    async addStage(@Param('taskId') taskId: string, @Body() dto: CreateTaskStageDto): Promise<TaskStage> {
        return await this.taskService.addStage(taskId, dto);
    }

    // Получение всех этапов задания
    @Get(':taskId/stages')
    @ApiParam(PARAM_TASK_ID_STAGE)
    @ApiOperation({
        summary: 'Получить все этапы для указанного задания',
    })
    @ApiResponse(GET_TASK_STAGES_BY_TASK)
    @ApiResponse(TASK_NOT_FOUND_RESPONSE)
    async getStages(@Param('taskId') taskId: string): Promise<TaskStage[] | null> {
        return await this.taskService.getStages(taskId);
    }

    // Обновление задания
    @Patch(':id')
    @ApiOperation({
        summary: 'Обновить данные задачи',
    })
    @ApiResponse(CREATE_TASK_SUCCESS_RESPONSE)
    @ApiResponse(NO_TASK_ACCESS_RESPONSE)
    @ApiResponse(TASK_NOT_FOUND_RESPONSE)
    @ApiParam(PARAM_TASK_ID)
    async updateTask(
        @Param('id') id: string,
        @Body() dto: UpdateTaskDto,
        @Req() req: Request & { user: User },
    ): Promise<Task> {
        return await this.taskService.updateTask(id, dto, req.user);
    }
}
