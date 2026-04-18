import { Post as IPost } from '@monorepo/types';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Public } from '@src/auth/decorator/public.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RepresentativeGuard } from '@src/auth/guards/representative.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { PARAM_POST_ID, PARAM_POST_USER_ID } from '@src/constants/swagger/api-param.swagger';
import {
    CREATE_POST_SUCCESS_RESPONSE,
    CREATE_POST_VALIDATION_ERROR_RESPONSE,
    GET_ALL_POST_BY_USER,
    GET_ALL_POSTS_SUCCESS_RESPONSE,
    GET_LATEST_POSTS,
    GET_POST_BY_ID,
    POST_NOT_FOUND_RESPONSE,
} from '@src/constants/swagger/post-responses.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
    FORBIDDEN_RESOURCE_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import { USER_NOT_FOUND_RESPONSE } from '@src/constants/swagger/user-responses.swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'posts',
    version: '1',
})
export class PostController {
    constructor(private readonly postService: PostService) {}

    // Создать публикацию (только для представителей)
    @UseGuards(RepresentativeGuard)
    @Post()
    @ApiOperation({ summary: 'Создать новую публикацию в блоге' })
    @ApiResponse(CREATE_POST_SUCCESS_RESPONSE)
    @ApiResponse(CREATE_POST_VALIDATION_ERROR_RESPONSE)
    createPost(@Body() dto: CreatePostDto, @Req() req: Request & { user: User }): Promise<IPost> {
        const authorId = req.user.id; // из JWT
        return this.postService.createPost(authorId, dto);
    }

    // Все публикации (только для администраторов)
    // @UseGuards(AdminGuard)
    @Get()
    @ApiOperation({
        summary: 'Получить все публикации',
    })
    @ApiResponse(GET_ALL_POSTS_SUCCESS_RESPONSE)
    @ApiResponse(FORBIDDEN_RESOURCE_RESPONSE)
    getPosts(@Query('limit') limit?: string): Promise<IPost[] | null> {
        const parsedLimit = Number(limit);
        return this.postService.getPosts(!isNaN(parsedLimit) ? parsedLimit : undefined);
    }

    // Получение последнии три последнии публикации
    @Get('latest')
    @Public()
    @ApiOperation({ summary: 'Получить последние 3 публикации (публичный доступ)' })
    @ApiResponse(GET_LATEST_POSTS)
    getLatestPosts(): Promise<IPost[] | null> {
        return this.postService.getLatestPosts();
    }

    // Все публикации одного пользователя (доступно всем авторизованным пользователям)
    @Get('user/:id')
    @ApiOperation({
        summary: 'Получить все публикации пользователя по ID пользователя',
    })
    @ApiParam(PARAM_POST_USER_ID)
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    @ApiResponse(GET_ALL_POST_BY_USER)
    getPostsByUserId(@Param('id') id: string): Promise<IPost[] | null> {
        return this.postService.getPostsByUserId(id);
    }

    // Одна публикация по ID (доступно всем авторизованным пользователям)
    @Get(':id')
    @ApiOperation({
        summary: 'Получить публикацию по ID публикации',
    })
    @ApiParam(PARAM_POST_ID)
    @ApiResponse(POST_NOT_FOUND_RESPONSE)
    @ApiResponse(GET_POST_BY_ID)
    getPostById(@Param('id') id: string): Promise<IPost | null> {
        return this.postService.getPostById(id);
    }

    // // Обновить
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    //     return this.postService.update(id, dto);
    // }

    // // Удалить
    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //     return this.postService.remove(id);
    // }
}
