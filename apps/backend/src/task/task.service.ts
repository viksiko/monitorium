import { Task, TaskListItem, TaskStage } from '@monorepo/types';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BalanceTransactionType, User } from '@prisma/client';
import { BalanceService } from '@src/balance/balance.service';
import { TASK_MESSAGES, USER_NOT_FOUND } from '@src/constants/api-messages.constants';
import { TOKEN_PARAMS } from '@src/constants/tokens-params';
import { logger } from '@src/logger/winston.logger';
import { NotificationService } from '@src/notification/notification.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { UpdateTaskData } from '@src/types/task';
import { CreateTaskStageDto } from './dto/create-task-stage.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { mapTaskListItemToDto } from './task.mapper';

@Injectable()
export class TaskService {
    constructor(
        private prisma: PrismaService,
        private balanceService: BalanceService,
        private readonly notificationService: NotificationService,
    ) {}

    async createTask(user: User, dto: CreateTaskDto): Promise<Task> {
        try {
            const { stages, assigneeId, ...taskData } = dto;

            if (!assigneeId) {
                throw new NotFoundException(TASK_MESSAGES.ASSIGNEE_NOT_FOUND);
            }

            // Проверяем, что если указаны этапы, то пользователь является представителем
            if (!user.isRepresentative && stages?.length) {
                throw new ForbiddenException(TASK_MESSAGES.STAGES_ONLY_FOR_REPRESENTATIVE);
            }

            const task = await this.prisma.$transaction(async (tx) => {
                let assigneeDistrictId: string | null = null;

                // Если указан исполнитель — проверяем, что это представитель
                if (assigneeId) {
                    const assignee = await tx.user.findUnique({
                        where: { id: assigneeId },
                        select: { role: true, districtId: true },
                    });

                    if (!assignee) {
                        throw new NotFoundException(TASK_MESSAGES.ASSIGNEE_NOT_FOUND);
                    }

                    if (assignee.role !== 'REPRESENTATIVE') {
                        throw new Error(TASK_MESSAGES.TASK_ASSIGNEE_MUST_BE_REPRESENTATIVE);
                    }

                    if (!assignee.districtId) {
                        throw new Error('У представителя не указан округ');
                    }

                    // Если автор назначает задачу самому себе и он представитель, баланс не списываем
                    const isRepresentativeSelfAssignedTask =
                        user.id === assigneeId && assignee.role === 'REPRESENTATIVE';

                    // Списание билеты у пользователя
                    if (!isRepresentativeSelfAssignedTask) {
                        await this.balanceService.withdrawBalanceTx(
                            tx,
                            user.id,
                            TOKEN_PARAMS.TASK_CREATION_PRICE,
                            BalanceTransactionType.CREATE_TASK,
                        );
                    }

                    assigneeDistrictId = assignee.districtId;
                }

                // Создание задачи с возможными этапами
                const creatTask = await tx.task.create({
                    data: {
                        ...taskData,

                        district: {
                            connect: { id: assigneeDistrictId! },
                        },

                        // автор
                        author: {
                            connect: { id: user.id },
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
                        author: { select: { id: true, name: true } },
                        assignee: assigneeId ? { select: { id: true, name: true } } : false,
                        district: true,
                        stages: true,
                    },
                });

                return creatTask;
            });

            // создаём уведомление представителю по websocket
            if (task.assigneeId && task.assigneeId !== user.id) {
                await this.notificationService.createAndSendNotification({
                    userId: task.assigneeId,
                    type: 'NEW_TASK_ASSIGNED',
                    title: 'Новое задание',
                    message: 'Вам назначена новая задача',
                    taskId: task.id,
                });
            }

            return task;
        } catch (error: unknown) {
            logger.error(
                'Failed create task' +
                    '\nauthorId: ' +
                    user.id +
                    '\ndto: ' +
                    JSON.stringify(dto) +
                    '\nerror: ' +
                    (error instanceof Error ? error.message : error),
                {
                    category: 'TaskService',
                    operation: 'createTask',
                    error: error instanceof Error ? error.message : error,
                },
            );

            throw error;
        }
    }

    async getTasks(limit?: number): Promise<TaskListItem[]> {
        try {
            const tasks = await this.prisma.task.findMany({
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: { select: { id: true, name: true } },
                    stages: true,
                    comments: true,
                    taskFiles: true,
                },
            });

            return tasks.map(mapTaskListItemToDto);
        } catch (error) {
            logger.error('Failed when getting the task list', {
                category: 'TaskService',
                operation: 'getAllTasks',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getLatestTasks(): Promise<TaskListItem[]> {
        return this.getTasks(3);
    }

    async getTasksByUser(user: User): Promise<TaskListItem[]> {
        const where = user.isRepresentative ? { assigneeId: user.id } : { authorId: user.id };

        try {
            const tasks = await this.prisma.task.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            // Используем ваш маппер
            return tasks.map(mapTaskListItemToDto);
        } catch (error) {
            logger.error('Failed when getting tasks for representative or voter', {
                category: 'TaskService',
                operation: 'getTasksByUser',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getTasksByUserId(userId: string): Promise<TaskListItem[]> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                throw new NotFoundException(USER_NOT_FOUND);
            }

            const tasks = await this.prisma.task.findMany({
                where: { assigneeId: userId },
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            if (!tasks) throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);

            return tasks.map(mapTaskListItemToDto);
        } catch (error) {
            logger.error('Failed when getting tasks for representative or voter', {
                category: 'TaskService',
                operation: 'getTasksByUserId',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getTaskById(id: string): Promise<Task> {
        try {
            const task = await this.prisma.task.findUnique({
                where: { id },
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: true,
                    stages: {
                        orderBy: {
                            date: 'asc', // сортировка по возрастанию
                        },
                    },
                    comments: true,
                    taskFiles: true,
                },
            });

            if (!task) throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);

            return task;
        } catch (error) {
            logger.error('Failed when getting the task by id', {
                category: 'TaskService',
                operation: 'getTaskById',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getTasksByFilter(query: { districtId?: string }): Promise<Task[]> {
        try {
            const { districtId } = query;

            const tasks = await this.prisma.task.findMany({
                where: {
                    ...(districtId && { districtId }), // ← фильтр только если передан
                },
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: true,
                    stages: {
                        orderBy: {
                            date: 'asc',
                        },
                    },
                    comments: true,
                    taskFiles: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return tasks;
        } catch (error) {
            logger.error('Failed to find tasks', {
                category: 'database',
                operation: 'getTasksByFilter',
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
    async addStage(taskId: string, dto: CreateTaskStageDto, user: User): Promise<TaskStage> {
        try {
            // Только представитель власти может создавать этапы
            if (!user.isRepresentative) {
                throw new ForbiddenException(TASK_MESSAGES.STAGES_ONLY_FOR_REPRESENTATIVE);
            }

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

    async getStages(taskId: string): Promise<TaskStage[]> {
        try {
            // Проверяем, существует ли задача
            const task = await this.prisma.task.findUnique({
                where: { id: taskId },
                select: { id: true }, // только проверка существования
            });

            if (!task) {
                throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
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

    async updateTask(id: string, dto: UpdateTaskDto, user: User): Promise<Task> {
        const updatedTask = await this.prisma.$transaction(async (tx) => {
            const task = await tx.task.findUnique({
                where: { id },
                include: { stages: true },
            });

            if (!task) {
                throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
            }

            if (task.assigneeId !== user.id) {
                throw new ForbiddenException(TASK_MESSAGES.NO_ACCESS);
            }

            const data: UpdateTaskData = {
                possibleSolutions: dto.possibleSolutions,
                desiredResolutionDate: dto.desiredResolutionDate,
                status: dto.status,
            };

            // удаление этапов
            if (dto.deletedStageIds?.length) {
                await tx.taskStage.deleteMany({
                    where: {
                        id: { in: dto.deletedStageIds },
                        taskId: task.id,
                    },
                });
            }

            // обновление / создание этапов
            if (dto.stages) {
                for (const stage of dto.stages) {
                    const isTempId = stage.id?.startsWith('temp');

                    if (!isTempId) {
                        await tx.taskStage.updateMany({
                            where: {
                                id: stage.id,
                                taskId: task.id,
                            },
                            data: {
                                title: stage.title,
                                date: new Date(stage.date),
                                isCompleted: stage.isCompleted,
                            },
                        });
                    } else {
                        await tx.taskStage.create({
                            data: {
                                title: stage.title,
                                date: new Date(stage.date),
                                taskId: task.id,
                                isCompleted: stage.isCompleted,
                            },
                        });
                    }
                }
            }

            // обновляем задачу
            const updatedTask = await tx.task.update({
                where: { id },
                data,
                include: {
                    author: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true } },
                    district: true,
                    stages: {
                        orderBy: { date: 'asc' },
                    },
                    comments: true,
                    taskFiles: true,
                },
            });

            return updatedTask;
        });

        // создаём уведомление избирателю по websocket
        await this.notificationService.createAndSendNotification({
            userId: updatedTask.author.id,
            type: 'TASK_STATUS_CHANGED',
            title: 'Изменения в задаче',
            message: 'Задача была обновлена',
            taskId: updatedTask.id,
        });

        return updatedTask;
    }
}
