import { Comment } from '@monorepo/types';
import { Injectable } from '@nestjs/common';
import { COMMENT_MESSAGES } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateCommentDto, validateCommentDto } from './dto/create-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { GetCommentsDto, validateGetCommentsDto } from './dto/get-comments.dto';

@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateCommentDto, authorId: string): Promise<Comment> {
        validateCommentDto(dto);

        try {
            const createdComment = await this.prisma.comment.create({
                data: {
                    ...dto,
                    authorId,
                },
            });

            return createdComment;
        } catch (error) {
            logger.error('Failed create comment', {
                category: 'CommentService',
                operation: 'create',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    async getComments(dto: GetCommentsDto): Promise<Comment[]> {
        validateGetCommentsDto(dto);

        try {
            const comments = await this.prisma.comment.findMany({
                where: {
                    ...dto,
                },
            });
            return comments;
        } catch (error) {
            logger.error('Failed get comments', {
                category: 'CommentService',
                operation: 'getComments',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    async editComment(dto: EditCommentDto, userId: string): Promise<Comment> {
        try {
            const editedComment = await this.prisma.comment.update({
                where: { id: dto.id, authorId: userId },
                data: {
                    content: dto.content,
                },
            });
            return editedComment;
        } catch (error) {
            logger.error('Failed edit comment', {
                category: 'CommentService',
                operation: 'editComment',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    async deleteComment(dto: DeleteCommentDto, userId: string): Promise<{ message: string }> {
        try {
            await this.prisma.comment.delete({
                where: { id: dto.id, authorId: userId },
            });
            return { message: COMMENT_MESSAGES.DELETE_SUCCESS };
        } catch (error) {
            logger.error('Failed delete comment', {
                category: 'CommentService',
                operation: 'deleteComment',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }
}
