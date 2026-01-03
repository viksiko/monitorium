import {
    Controller,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiHeader,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@src/auth/guards/access.guard';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
    DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE,
    USER_ACCOUNT_DEACTIVATED_RESPONSE,
    USER_LIST_SUCCESS_RESPONSE,
    USER_NOT_FOUND_RESPONSE,
} from '@src/constants/api-responses.swagger';
import { User, UserResponse } from '@src/types/user';
import { UserService } from './user.service';

@Controller({
    path: 'users',
    version: '1',
})
@ApiTags('Пользователи')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Получить всех пользователей или одного по email
    @Get()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Получить всех пользователей или найти по email' })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT токен в формате Bearer <token>',
        required: true,
    })
    @ApiQuery({
        name: 'email',
        description: 'Опциональный email для поиска конкретного пользователя',
        required: false,
        type: String,
        example: '/api/v1/users?email=user1@test.test',
    })
    @ApiResponse(USER_LIST_SUCCESS_RESPONSE)
    @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async getUsers(
        @Query('email') email?: string,
    ): Promise<UserResponse[] | User | null> {
        if (email) {
            return this.userService.findUserByEmail(email);
        }
        return this.userService.getUsers();
    }

    // Получить пользователя по id
    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Получить пользователя по Id' })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT токен в формате Bearer <token>',
        required: true,
    })
    @ApiParam({
        name: 'id',
        description: 'Обязательный параметр',
        required: true,
        type: String,
        example: '/api/v1/users/cmik6d2sm0000mojf4oz1jraa',
    })
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async findUserById(@Param('id') id: string): Promise<User | null> {
        return this.userService.findUserById(id);
    }

    // Деактивация пользователя
    @Patch(':id/deactivate')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Деакивация (удаление) пользователя' })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT токен в формате Bearer <token>',
        required: true,
    })
    @ApiParam({
        name: 'id',
        description: 'Обязательный параметр',
        required: true,
        type: String,
        example: '/api/v1/users/cmik6d2sm0000mojf4oz1jraa/deactivate',
    })
    @ApiResponse(USER_ACCOUNT_DEACTIVATED_RESPONSE)
    @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    @ApiResponse(DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)

    // @Roles('Admin', 'Self') // Проверяем, что запрос делает либо админ, либо сам пользователь
    async deactivateUser(
        @Param('id') id: string,
        @Req() req: Request & { user: User },
    ): Promise<{ message: string }> {
        return await this.userService.deactivateUser(id, req.user.id);
    }
}
