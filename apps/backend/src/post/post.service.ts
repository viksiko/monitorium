import { Post } from '@monorepo/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { POST_NOT_FOUND, USER_NOT_FOUND } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { NotificationService } from '@src/notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) {}

    async createPost(authorId: string, dto: CreatePostDto): Promise<Post> {
        try {
            const { post, subscribers } = await this.prisma.$transaction(async (tx) => {
                const post = await tx.post.create({
                    data: {
                        title: dto.title,
                        content: dto.content,
                        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
                        authorId,
                    },
                    include: {
                        author: {
                            select: {
                                name: true,
                                district: { select: { id: true, name: true } },
                            },
                        },
                        files: true,
                    },
                });

                const subscribers = await tx.subscription.findMany({
                    where: {
                        representativeId: authorId,
                    },
                    select: {
                        subscriberId: true,
                    },
                });

                // if (subscribers.length > 0) {
                //     await tx.notification.createMany({
                //         data: subscribers.map((s) => ({
                //             userId: s.subscriberId,
                //             type: 'NEW_POST',
                //             title: 'Новая публикация',
                //             message: post.title,
                //             postId: post.id,
                //         })),
                //     });
                // }

                return { post, subscribers };
            });

            // создаём избирателю представителю по websocket
            if (subscribers.length > 0) {
                await Promise.all(
                    subscribers.map((s) =>
                        this.notificationService.createAndSendNotification({
                            userId: s.subscriberId,
                            type: 'NEW_POST',
                            title: 'Новая публикация',
                            message: post.title,
                            postId: post.id,
                        }),
                    ),
                );
            }

            return post;
        } catch (error) {
            logger.error('Failed create post', {
                category: 'PostService',
                operation: 'createPost',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getPosts(limit?: number): Promise<Post[]> {
        try {
            const posts = await this.prisma.post.findMany({
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    author: {
                        select: {
                            name: true,
                            district: { select: { id: true, name: true } },
                        },
                    },
                    files: true,
                },
            });

            return posts;
        } catch (error) {
            logger.error('Failed when getting the post list', {
                category: 'PostService',
                operation: 'getAllPosts',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getLatestPosts(): Promise<Post[]> {
        return this.getPosts(3);
    }

    async getPostsByUserId(userId: string): Promise<Post[]> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true },
            });

            if (!user) {
                throw new NotFoundException(USER_NOT_FOUND);
            }

            const posts = await this.prisma.post.findMany({
                where: { authorId: userId },
                orderBy: { publishedAt: 'desc' },
                include: {
                    author: {
                        select: {
                            name: true,
                            district: { select: { id: true, name: true } },
                        },
                    },
                    files: true,
                },
            });

            return posts;
        } catch (error) {
            logger.error('Failed when getting posts by user id', {
                category: 'PostService',
                operation: 'getPostsByUserId',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getPostById(id: string): Promise<Post> {
        try {
            const post = await this.prisma.post.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            name: true,
                            district: { select: { id: true, name: true } },
                            representativeProfile: {
                                select: {
                                    position: true,
                                },
                            },
                        },
                    },
                    files: true,
                },
            });

            if (!post) throw new NotFoundException(POST_NOT_FOUND);

            return post;
        } catch (error) {
            logger.error('Failed when getting the post by id', {
                category: 'PostService',
                operation: 'getPostById',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // async update(id: string, dto: UpdatePostDto) {
    //     await this.findOne(id);

    //     return this.prisma.post.update({
    //         where: { id },
    //         data: {
    //             ...dto,
    //             publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
    //         },
    //     });
    // }

    // async remove(id: string) {
    //     await this.findOne(id);

    //     return this.prisma.post.delete({
    //         where: { id },
    //     });
    // }
}
