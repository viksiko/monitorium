import { TaskListItem } from '@monorepo/types';
import { Task, TaskStage } from '@monorepo/types';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Public } from '@src/auth/decorator/public.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_TASK_ID, PARAM_TASK_ID_STAGE, PARAM_TASK_USER_ID } from '@src/constants/swagger/api-param.swagger';
import { TASK_FILTER_QUERY_DISTRICT } from '@src/constants/swagger/api-query.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
    FORBIDDEN_RESOURCE_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import {
    CREATE_TASK_STAGES_SUCCESS_RESPONSE,
    CREATE_TASK_STAGES_VALIDATION_ERROR_RESPONSE,
    CREATE_TASK_SUCCESS_RESPONSE,
    CREATE_TASK_VALIDATION_ERROR_RESPONSE,
    GET_ALL_TASKS_SUCCESS_RESPONSE,
    GET_TASK_BY_ID,
    GET_TASK_STAGES_BY_TASK,
    NO_TASK_ACCESS_RESPONSE,
    TASK_BAD_REQUEST_RESPONSE,
    TASK_DELETE_SUCCESS_RESPONSE,
    TASK_FILTER_LIST_SUCCESS_RESPONSE,
    TASK_NOT_FOUND_RESPONSE,
} from '@src/constants/swagger/task-responses.swagger';
import { USER_NOT_FOUND_RESPONSE } from '@src/constants/swagger/user-responses.swagger';
import { CreateTaskStageDto } from './dto/create-task-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksFilterDto } from './dto/tasks-filter.dto';
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

    @Get()
    @ApiOperation({
        summary: 'Получить все задания',
    })
    @ApiResponse(GET_ALL_TASKS_SUCCESS_RESPONSE)
    @ApiResponse(FORBIDDEN_RESOURCE_RESPONSE)
    getTasks(@Query('limit') limit?: string): Promise<TaskListItem[] | null> {
        const parsedLimit = Number(limit);
        return this.taskService.getTasks(!isNaN(parsedLimit) ? parsedLimit : undefined);
    }

    // Получение всех задач текущего пользователя
    @Get('user-tasks')
    @ApiOperation({
        summary: 'Получить все задания текущего пользователя',
    })
    @ApiResponse(GET_ALL_TASKS_SUCCESS_RESPONSE)
    async getTasksByUser(@Req() req: Request & { user: User }): Promise<TaskListItem[]> {
        const user = req.user;
        return await this.taskService.getTasksByUser(user);
    }

    // Получить всех задач по фильтру
    @Get('filter')
    @ApiOperation({ summary: 'Получить задачи по параметрам фильтрации' })
    @ApiQuery(TASK_FILTER_QUERY_DISTRICT)
    @ApiResponse(TASK_FILTER_LIST_SUCCESS_RESPONSE)
    @ApiResponse(TASK_BAD_REQUEST_RESPONSE)
    // @ApiResponse(USER_BAD_REQUEST_RESPONSE)
    async getTasksByFilter(@Query() query: TasksFilterDto): Promise<Task[]> {
        return this.taskService.getTasksByFilter(query);
    }

    @Get('latest')
    @Public()
    @ApiOperation({ summary: 'Получить последние 3 задачи (публичный доступ)' })
    getLatestTasks(): Promise<TaskListItem[]> {
        return this.taskService.getLatestTasks();
    }

    // Получение всех задач по userid
    @Get('user/:id')
    @ApiOperation({
        summary: 'Получить все задания по ID пользователя',
    })
    @ApiResponse(GET_ALL_TASKS_SUCCESS_RESPONSE)
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    @ApiParam(PARAM_TASK_USER_ID)
    async getTasksByUserId(@Param('id') id: string): Promise<TaskListItem[]> {
        return await this.taskService.getTasksByUserId(id);
    }

    // Получение задания по ID
    @Get(':id')
    @ApiOperation({
        summary: 'Получить задание по ID',
    })
    @ApiResponse(GET_TASK_BY_ID)
    @ApiResponse(TASK_NOT_FOUND_RESPONSE)
    @ApiParam(PARAM_TASK_ID)
    getTaskById(@Param('id') id: string): Promise<Task> {
        return this.taskService.getTaskById(id);
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
    async getStages(@Param('taskId') taskId: string): Promise<TaskStage[]> {
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
