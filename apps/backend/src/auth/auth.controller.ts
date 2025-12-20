import { UserProfile } from '@monorepo/types';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    DATABASE_ERROR_RESPONSE,
    EMAIL_NOT_VERIFIED_CONFLICT_RESPONSE,
    INVALID_TOKEN_RESPONSE,
    LOGIN_VALIDATION_ERROR_RESPONSE,
    LOGOUT_SUCCESS_RESPONSE,
    REFRESH_INVALID,
    REFRESH_SUCCESS_RESPONSE,
    REGISTRATION_CONFIRMED_RESPONSE,
    SERVER_ERROR_RESPONSES_REGISTR,
    UNAUTHORIZED_LOGIN_RESPONSE,
    USER_CONFLICT_RESPONSE,
    USER_LOGIN_SUCCESS_RESPONSE,
    USER_REGISTER_SUCCESS_RESPONSE,
    VALIDATION_ERROR_RESPONSE,
} from '@src/constants/api-responses.swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller({
    path: 'auth',
    version: '1',
})
@ApiTags('Регистрация/авторизация')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse(USER_REGISTER_SUCCESS_RESPONSE)
    @ApiResponse(VALIDATION_ERROR_RESPONSE)
    @ApiResponse(USER_CONFLICT_RESPONSE)
    @ApiResponse(SERVER_ERROR_RESPONSES_REGISTR)
    async register(
        @Body() registerDto: RegisterDto,
    ): Promise<{ message: string }> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Авторизация пользователя' })
    @ApiResponse(USER_LOGIN_SUCCESS_RESPONSE)
    @ApiResponse(LOGIN_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(LOGIN_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(UNAUTHORIZED_LOGIN_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{
        accessToken: string;
        userProfile: UserProfile;
    }> {
        return this.authService.login(loginDto, response);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Обновление refreshToken' })
    @ApiResponse(REFRESH_SUCCESS_RESPONSE)
    @ApiResponse(REFRESH_INVALID)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{
        accessToken: string;
        userProfile: UserProfile;
    }> {
        return this.authService.refresh(request, response);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Выход из приложения' })
    @ApiResponse(LOGOUT_SUCCESS_RESPONSE)
    @ApiResponse(REFRESH_INVALID)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{
        message: string;
    }> {
        return await this.authService.logout(request, response);
    }

    @Get('confirm')
    @ApiOperation({ summary: 'Подтверждение регистрации' })
    @ApiOperation({ summary: 'Подтверждение регистрации по токену из Email' })
    @ApiResponse(REGISTRATION_CONFIRMED_RESPONSE)
    @ApiResponse(INVALID_TOKEN_RESPONSE)
    @ApiResponse(EMAIL_NOT_VERIFIED_CONFLICT_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    @ApiQuery({
        name: 'token',
        description: 'Токен подтверждения регистрации, отправленный на email',
        required: true,
        type: String,
        example:
            '/api/v1/auth/confirm?token=ee4340b9-0fe0-4c49-983d-2cd9283d0c29',
    })
    async confirm(
        @Query('token') token: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        await this.authService.confirmRegistration(token);
        return response.redirect(`${process.env.VITE_FRONTEND_URL}/login`);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Запрос на восстановление пароля' })
    @ApiResponse({ status: 200, description: 'Письмо отправлено' })
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string }> {
        const res = await this.authService.forgotPassword(forgotPasswordDto);

        return res;
    }
}
