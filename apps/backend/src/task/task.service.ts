import { TaskListItem } from '@monorepo/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStage, User } from '@prisma/client';
import { TASK_MESSAGES } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateTaskStageDto } from './dto/create-task-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { mapTaskListItemToDto } from './task.mapper';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async createTask(authorId: string, dto: CreateTaskDto): Promise<Task> {
        try {
            const { stages, assigneeId, ...taskData } = dto;

            // Если указан исполнитель — проверяем, что это представитель
            if (assigneeId) {
                const assignee = await this.prisma.user.findUnique({
                    where: { id: assigneeId },
                    select: { role: true },
                });

                if (!assignee) {
                    throw new Error('Assignee not found');
                }

                if (assignee.role !== 'REPRESENTATIVE') {
                    throw new Error(
                        'Task can be assigned only to representative',
                    );
                }
            }

            // Создание задачи с возможными этапами
            return await this.prisma.task.create({
                data: {
                    ...taskData,

                    // автор
                    author: {
                        connect: { id: authorId },
                    },

                    // исполнитель (опционально)
                    ...(assigneeId && {
                        assignee: {
                            connect: { id: assigneeId },
                        },
                    }),

                    // этапы
                    ...(stages?.length && {
                        stages: {
                            create: stages.map((stage) => ({
                                title: stage.title,
                                date: new Date(stage.date),
                            })),
                        },
                    }),
                },
                include: {
                    stages: true,
                },
            });
        } catch (error) {
            console.error('Error creating task:', error);
            logger.error('Failed create task', {
                category: 'TaskService',
                operation: 'create',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async findAll(): Promise<Task[]> {
        try {
            return await this.prisma.task.findMany({
                include: {
                    stages: true,
                    comments: true,
                    taskFiles: true,
                },
            });
        } catch (error) {
            logger.error('Failed when getting the task list', {
                category: 'TaskService',
                operation: 'findAll',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getTasksByUser(user: User): Promise<TaskListItem[]> {
        const where = user.isRepresentative
            ? { assigneeId: user.id }
            : { authorId: user.id };

        try {
            const tasks = await this.prisma.task.findMany({
                where: where,
                select: {
                    id: true,
                    title: true,
                    address: true,
                    desiredResolutionDate: true,
                    likesCount: true,
                    viewsCount: true,
                    status: true,
                    createdAt: true,
                    // Можно добавить данные об авторе, если представителю нужно их видеть
                    // user: {
                    //     select: {
                    //         name: true,
                    //     },
                    // },
                },
                orderBy: { createdAt: 'desc' },
            });

            // Используем ваш маппер
            return tasks.map(mapTaskListItemToDto);
        } catch (error) {
            logger.error(
                'Failed when getting tasks for representative or voter',
                {
                    category: 'TaskService',
                    operation: 'getTasksByUser',
                    error: error instanceof Error ? error.message : error,
                },
            );

            throw error;
        }
    }

    async findOne(id: string): Promise<Task | null> {
        try {
            return this.prisma.task.findUnique({
                where: { id },
                include: {
                    stages: true,
                    comments: true,
                    taskFiles: true,
                },
            });
        } catch (error) {
            logger.error('Failed when getting the task by id', {
                category: 'TaskService',
                operation: 'findAll',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    //     return this.prisma.task.update({
    //         where: { id },
    //         data: dto,
    //     });
    // }

    async remove(id: string): Promise<{ message: string }> {
        try {
            await this.prisma.task.delete({ where: { id } });
            return { message: TASK_MESSAGES.DELETE_SUCCESS };
        } catch (error) {
            logger.error('Failed when delete task', {
                category: 'TaskService',
                operation: 'remove',
                error: error instanceof Error ? error.message : error,
            });

            throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
        }
    }

    /**Этапы заданий**/
    // Проверка, существует ли задача и добавление этапа
    async addStage(
        taskId: string,
        dto: CreateTaskStageDto,
    ): Promise<TaskStage> {
        try {
            // Проверяем, что задача существует
            const task = await this.prisma.task.findUnique({
                where: { id: taskId },
            });
            if (!task) {
                throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
            }

            // Создаём новый этап
            const stage = await this.prisma.taskStage.create({
                data: {
                    taskId,
                    title: dto.title,
                    date: new Date(dto.date),
                },
            });

            return stage;
        } catch (error) {
            logger.error('Failed create to stage for task', {
                category: 'TaskService',
                operation: 'addStage',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getStages(taskId: string): Promise<TaskStage[] | null> {
        try {
            // Проверяем, существует ли задача
            const task = await this.prisma.task.findUnique({
                where: { id: taskId },
                select: { id: true }, // только проверка существования
            });

            if (!task) {
                throw new NotFoundException('Задача не найдена');
            }

            // Получаем все этапы
            const stages = await this.prisma.taskStage.findMany({
                where: { taskId },
                orderBy: { date: 'asc' }, // по дате по возрастанию
            });

            return stages;
        } catch (error) {
            logger.error('Failed when getting stages to task', {
                category: 'TaskService',
                operation: 'getStages',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
