import { UserProfile } from '@monorepo/types';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    AUTH_CONFLICT_RESPONSE,
    FORGOT_PASSWORD_SUCCESS_RESPONSE,
    INVALID_RESET_PASSWORD_TOKEN_RESPONSE,
    INVALID_VERIFICATION_CODE_RESPONSE,
    LOGIN_VALIDATION_ERROR_RESPONSE,
    LOGOUT_SUCCESS_RESPONSE,
    REFRESH_INVALID,
    REFRESH_SUCCESS_RESPONSE,
    REGISTRATION_CONFIRMED_RESPONSE,
    REPRESENTATIVE_REQUEST_CREATED_RESPONSE,
    REPRESENTATIVE_VALIDATION_ERROR_RESPONSE,
    RESET_PASSWORD_CHANGED,
    TOO_MANY_REQUESTS_RESPONSE,
    USER_CONFLICT_RESPONSE,
    USER_LOGIN_SUCCESS_RESPONSE,
    USER_REGISTER_SUCCESS_RESPONSE,
    VALIDATION_ERROR_RESPONSE,
    VALIDATION_FORGOT_PASSWORD_ERROR_RESPONSE,
    VALIDATION_RESET_PASSWORD_ERROR_RESPONSE,
} from '@src/constants/swagger/auth-responses.swagger';
import {
    DATABASE_ERROR_RESPONSE,
    SERVER_ERROR_RESPONSES_REGISTR,
} from '@src/constants/swagger/shared-responses.swagger';
import { User } from '@src/types/user';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { СonfirmRegistration } from './dto/confirmRegistration';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RepresentativeRequestDto } from './dto/representativeRequest.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя (Шаг 1)' })
    @ApiResponse(USER_REGISTER_SUCCESS_RESPONSE)
    @ApiResponse(VALIDATION_ERROR_RESPONSE)
    @ApiResponse(USER_CONFLICT_RESPONSE)
    @ApiResponse(SERVER_ERROR_RESPONSES_REGISTR)
    async register(@Body() registerDto: RegisterDto): Promise<User> {
        // const isRepresentative = registerDto.type === RegisterRoleEnum.REPRESENTATIVE;
        return this.authService.register(registerDto);
    }

    @Post('confirm-registration')
    @ApiOperation({
        summary: 'Подтверждение регистрации по коду (Шаг 2)',
    })
    @ApiResponse(REGISTRATION_CONFIRMED_RESPONSE)
    @ApiResponse(INVALID_VERIFICATION_CODE_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async confirmRegistration(
        @Body() dto: СonfirmRegistration,
    ): Promise<{ message: string }> {
        return await this.authService.confirmRegistration(dto);
    }

    @Post('representative-request')
    @ApiOperation({
        summary: 'Отправка заявки представителя власти на рассмотрение (Шаг 3)',
    })
    @ApiResponse(REPRESENTATIVE_REQUEST_CREATED_RESPONSE)
    @ApiResponse(REPRESENTATIVE_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async representativeRequest(
        @Body() dto: RepresentativeRequestDto,
    ): Promise<{ message: string }> {
        return await this.authService.representativeRequest(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Авторизация пользователя' })
    @ApiResponse(USER_LOGIN_SUCCESS_RESPONSE)
    @ApiResponse(LOGIN_VALIDATION_ERROR_RESPONSE)
    @ApiResponse(AUTH_CONFLICT_RESPONSE)
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
        return await this.authService.refresh(request, response);
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

    @Post('forgot-password')
    @UseGuards(CustomThrottlerGuard)
    @ApiOperation({ summary: 'Запрос на восстановление пароля' })
    @ApiResponse(VALIDATION_FORGOT_PASSWORD_ERROR_RESPONSE)
    @ApiResponse(FORGOT_PASSWORD_SUCCESS_RESPONSE)
    @ApiResponse(TOO_MANY_REQUESTS_RESPONSE)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string }> {
        return await this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @UseGuards(CustomThrottlerGuard)
    @ApiOperation({ summary: 'Запрос на изменение пароля' })
    @ApiResponse(RESET_PASSWORD_CHANGED)
    @ApiResponse(DATABASE_ERROR_RESPONSE)
    @ApiResponse(VALIDATION_RESET_PASSWORD_ERROR_RESPONSE)
    @ApiResponse(TOO_MANY_REQUESTS_RESPONSE)
    @ApiResponse(INVALID_RESET_PASSWORD_TOKEN_RESPONSE)
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        return await this.authService.resetPassword(resetPasswordDto);
    }

    // Старый способ подтверждения регистрации по токену из email, пока не используется, возможно можно будет переделать по refresh

    // @Get('confirm-registration')
    // @ApiOperation({
    //     summary: 'Подтверждение регистрации !!! НЕ ИСПОЛЬЗУЕТСЯ !!!',
    // })
    // @ApiOperation({ summary: 'Подтверждение регистрации по токену из Email' })
    // @ApiResponse(REGISTRATION_CONFIRMED_RESPONSE)
    // @ApiResponse(INVALID_TOKEN_RESPONSE)
    // @ApiResponse(DATABASE_ERROR_RESPONSE)
    // @ApiQuery({
    //     name: 'token',
    //     description: 'Токен подтверждения регистрации, отправленный на email',
    //     required: true,
    //     type: String,
    //     example:
    //         '/api/v1/auth/confirm?token=ee4340b9-0fe0-4c49-983d-2cd9283d0c29',
    // })
    // async confirmRegistration(
    //     @Query('token') token: string,
    //     @Res() res: Response,
    // ): Promise<void> {
    //     try {
    //         await this.authService.confirmRegistration(token);

    //         return res.redirect(
    //             `${process.env.VITE_FRONTEND_URL}/confirm-registration`,
    //         );
    //     } catch {
    //         return res.redirect(
    //             `${process.env.VITE_FRONTEND_URL}/confirm-registration-failed`,
    //         );
    //     }
    // }

    // @Get('cookie')
    // testCookie(@Res({ passthrough: true }) response: Response) {
    //     // Устанавливаем тестовую куку
    //     response.cookie('testCookie', 'testValue', {
    //         httpOnly: true, // JS не видит, безопасно
    //         secure: false, // DEV: http, true для prod + HTTPS
    //         sameSite: 'lax', // Lax для SPA
    //         maxAge: 24 * 60 * 60 * 1000, // 1 день
    //         path: '/', // Важно: отправляется на все пути
    //     });

    //     return { message: 'Cookie set' };
    // }
}
