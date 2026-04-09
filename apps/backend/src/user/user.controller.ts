import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from '@src/auth/guards/admin.guard';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import { USER_FILTER_QUERY_DISTRICT, USER_FILTER_QUERY_ROLE } from '@src/constants/swagger/api-query.swagger';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
    FORBIDDEN_RESOURCE_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import {
    DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE,
    GET_CURRENT_USER_RESPONSE,
    USER_ACCOUNT_DEACTIVATED_RESPONSE,
    USER_BAD_REQUEST_RESPONSE,
    USER_FILTER_LIST_SUCCESS_RESPONSE,
    USER_LIST_SUCCESS_RESPONSE,
    USER_NOT_FOUND_RESPONSE,
} from '@src/constants/swagger/user-responses.swagger';
import { User, UserResponse, UserWithRepresentativeProfileDto, UserWithVoterProfileDto } from '@src/types/user';
import { UsersFilterDto } from './dto/users-filter.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'users',
    version: '1',
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Получить всех пользователей
    @UseGuards(AdminGuard)
    @Get()
    @ApiOperation({ summary: 'Получить всех пользователей (требуются права администратора)' })
    @ApiResponse(USER_LIST_SUCCESS_RESPONSE)
    @ApiResponse(FORBIDDEN_RESOURCE_RESPONSE)
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    // Получить всех пользователей по фильтру
    @Get('filter')
    @ApiOperation({ summary: 'Получить пользователей по параметрам фильтрации' })
    @ApiQuery(USER_FILTER_QUERY_ROLE)
    @ApiQuery(USER_FILTER_QUERY_DISTRICT)
    @ApiResponse(USER_FILTER_LIST_SUCCESS_RESPONSE)
    @ApiResponse(USER_BAD_REQUEST_RESPONSE)
    async getUsersByFilter(
        @Query() query: UsersFilterDto,
    ): Promise<UserWithRepresentativeProfileDto[] | UserWithVoterProfileDto[]> {
        return this.userService.getUsersByFilter(query);
    }

    // // Получить всех пользователей или одного по email
    // @Get()
    // @ApiOperation({ summary: 'Найти пользователей по email' })
    // @ApiHeader(HEADERS_AUTHORIZATION)
    // @ApiQuery({
    //     name: 'email',
    //     description: 'Опциональный email для поиска конкретного пользователя',
    //     required: false,
    //     type: String,
    //     example: '/api/v1/users/search?email=user@test.com',
    // })
    // @ApiResponse(USER_LIST_SUCCESS_RESPONSE)
    // @ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
    // @ApiResponse(USER_NOT_FOUND_RESPONSE)
    // @ApiResponse(DATABASE_ERROR_RESPONSE)
    // async getUserByEmail(@Query('email') email: string): Promise<User> {
    //     return this.userService.getUserByEmail(email);
    // }

    // получить данные текущего пользователя
    @Get('profile')
    @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
    @ApiResponse(GET_CURRENT_USER_RESPONSE)
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    async getUserProfile(@Req() req: Request & { user: { id: string } }): Promise<UserResponse> {
        console.log('profile');
        return this.userService.getUserProfile(req.user.id);
    }

    // Получить пользователя по id
    @Get(':id')
    @ApiOperation({ summary: 'Получить пользователя по Id' })
    @ApiParam({
        name: 'id',
        description: 'Обязательный параметр',
        required: true,
        type: String,
        example: '/api/v1/users/cmik6d2sm0000mojf4oz1jraa',
    })
    @ApiResponse(GET_CURRENT_USER_RESPONSE)
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    @ApiResponse(USER_NOT_FOUND_RESPONSE)
    async getUserById(@Param('id') id: string): Promise<UserResponse> {
        return this.userService.getUserById(id);
    }

    // Деактивация пользователя
    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Деакивация (удаление) пользователя' })
    @ApiParam({
        name: 'id',
        description: 'Обязательный параметр',
        required: true,
        type: String,
        example: '/api/v1/users/cmik6d2sm0000mojf4oz1jraa/deactivate',
    })
    @ApiResponse(USER_ACCOUNT_DEACTIVATED_RESPONSE)
    @ApiResponse(DEACTIVATE_OWN_ACCOUNT_ERROR_RESPONSE)

    // @Roles('Admin', 'Self') // Проверяем, что запрос делает либо админ, либо сам пользователь
    async deactivateUser(@Param('id') id: string, @Req() req: Request & { user: User }): Promise<{ message: string }> {
        return await this.userService.deactivateUser(id, req.user.id);
    }
}
