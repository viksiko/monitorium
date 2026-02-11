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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import {
    DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE,
    GET_CURRENT_USER_RESPONSE,
    USER_ACCOUNT_DEACTIVATED_RESPONSE,
    USER_LIST_SUCCESS_RESPONSE,
    USER_NOT_FOUND_RESPONSE,
} from '@src/constants/swagger/user-responses.swagger';
import {
    User,
    UserResponse,
    UserWithRepresentativeProfileDto,
    UserWithVoterProfileDto,
} from '@src/types/user';
import { UserService } from './user.service';

@Controller({
    path: 'users',
    version: '1',
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Получить всех пользователей или одного по email
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить всех пользователей или найти по email' })
    @ApiHeader(HEADERS_AUTHORIZATION)
    @ApiQuery({
        name: 'email',
        description: 'Опциональный email для поиска конкретного пользователя',
        required: false,
        type: String,
        example: '/api/v1/users?email=user1@test.test',
    })
    @ApiQuery({
        name: 'role',
        description: 'Фильтр по роли (voter | representative)',
        required: false,
        example: '/api/v1/users?role=representative',
    })
    @ApiResponse(USER_LIST_SUCCESS_RESPONSE)
    @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async getUsers(
        @Query('email') email?: string,
        @Query('role') role?: string,
    ): Promise<
        (UserWithRepresentativeProfileDto | UserWithVoterProfileDto)[] | null
    > {
        // if (email) {
        //     return this.userService.findUserByEmail(email);
        // }
        return this.userService.getUsers(role);
    }

    // получить данные текущего пользователя
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
    @ApiHeader(HEADERS_AUTHORIZATION)
    @ApiResponse(GET_CURRENT_USER_RESPONSE)
    @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async getUserProfile(
        @Req() req: Request & { user: { id: string } },
    ): Promise<UserResponse | null> {
        return this.userService.getUserProfile(req.user.id);
    }

    // Получить пользователя по id
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить пользователя по Id' })
    @ApiHeader(HEADERS_AUTHORIZATION)
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
    async findUserById(@Param('id') id: string): Promise<UserResponse | null> {
        return this.userService.findUserById(id);
    }

    // Деактивация пользователя
    @UseGuards(JwtAuthGuard)
    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Деакивация (удаление) пользователя' })
    @ApiHeader(HEADERS_AUTHORIZATION)
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
