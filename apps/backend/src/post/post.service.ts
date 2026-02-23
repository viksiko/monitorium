import { Post, PostWithoutAuthor } from '@monorepo/types';
import { Injectable } from '@nestjs/common';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async createPost(authorId: string, dto: CreatePostDto): Promise<PostWithoutAuthor> {
        try {
            return this.prisma.post.create({
                data: {
                    title: dto.title,
                    content: dto.content,
                    publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
                    authorId,
                },
                include: {
                    files: true,
                },
            });
        } catch (error) {
            console.error('Error creating post:', error);
            logger.error('Failed create post', {
                category: 'PostService',
                operation: 'createPost',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async findAllPosts(): Promise<PostWithoutAuthor[] | null> {
        try {
            const posts = await this.prisma.post.findMany({
                orderBy: { publishedAt: 'desc' },
                include: {
                    files: true,
                },
            });

            return posts.length > 0 ? posts : null;
        } catch (error) {
            logger.error('Failed when getting the post list', {
                category: 'PostService',
                operation: 'findAllPosts',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async findAllPostsByUserId(userId: string): Promise<PostWithoutAuthor[] | null> {
        try {
            const posts = await this.prisma.post.findMany({
                where: { authorId: userId },
                orderBy: { publishedAt: 'desc' },
                include: {
                    files: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return posts.length > 0 ? posts : null;
        } catch (error) {
            logger.error('Failed when getting posts by user id', {
                category: 'PostService',
                operation: 'findAllPostsByUserId',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async findOnePostById(id: string): Promise<Post | null> {
        try {
            return await this.prisma.post.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            name: true,
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
        } catch (error) {
            logger.error('Failed when getting the post by id', {
                category: 'PostService',
                operation: 'findOnePostById',
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
