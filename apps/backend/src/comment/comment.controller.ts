import { Comment } from '@monorepo/types';
import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import {
    CREATE_COMMENT_SUCCESS_RESPONSE,
    CREATE_COMMENT_VALIDATION_ERROR_RESPONSE,
} from '@src/constants/swagger/comment-responses.swagger';
import { User } from '@src/types/user';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';

@UseGuards(JwtAuthGuard)
@Controller({
    path: 'comments',
    version: '1',
})
export class CommentController {
    constructor(private commentService: CommentService) {}

    @Post()
    @ApiOperation({ description: 'Создать комментарий может любой пользователь', summary: 'Создать комментарий' })
    @ApiResponse(CREATE_COMMENT_SUCCESS_RESPONSE)
    @ApiResponse(CREATE_COMMENT_VALIDATION_ERROR_RESPONSE)
    createComment(@Body() dto: CreateCommentDto, @Req() req: Request & { user: User }): Promise<Comment> {
        const authorId = req.user.id;
        return this.commentService.create(dto, authorId);
    }

    @Get()
    @ApiOperation({ description: 'Получить комментарии может любой пользователь', summary: 'Получить комментарии' })
    getComments(@Query() dtoQuery: GetCommentsDto): Promise<Comment[]> {
        return this.commentService.getComments(dtoQuery);
    }

    @Patch()
    @ApiOperation({
        description: 'Изменить комментарий может только автор комментария',
        summary: 'Изменить комментарий',
    })
    editComment(@Body() dto: EditCommentDto, @Req() req: Request & { user: User }): Promise<Comment> {
        const userId = req.user.id;
        return this.commentService.editComment(dto, userId);
    }

    @Delete()
    @ApiOperation({ description: 'Удалить комментарий может только автор комментария', summary: 'Удалить комментарий' })
    deleteComment(@Query() dto: DeleteCommentDto, @Req() req: Request & { user: User }): Promise<{ message: string }> {
        const userId = req.user.id;
        return this.commentService.deleteComment(dto, userId);
    }
}
