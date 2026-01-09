import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/auth/auth.controller';
import { AuthService } from '@src/auth/auth.service';
import { LoginDto } from '@src/auth/dto/login.dto';
import { RegisterDto } from '@src/auth/dto/register.dto';
import { CustomThrottlerGuard } from '@src/auth/guards/custom-throttler.guard';
import { Response } from 'express';

jest.mock('uuid', () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    v4: () => 'test-uuid',
}));

const mockConfigService = {
    get: jest.fn(),
};

const userProfile = {
    id: 'user-id',
    name: 'Test',
    email: 'test@test.test',
    phone: '79998887766',
    role: 'USER',
};

const registerDto = {
    name: 'Test',
    email: 'test@test.test',
    phone: '79998887766',
    password: 'StrongP@ssw0rd',
};

const loginDto = {
    email: 'test@test.test',
    password: 'StrongP@ssw0rd',
};

describe('AuthController (unit)', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
        refresh: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        })
            .overrideGuard(CustomThrottlerGuard)
            .useValue({
                canActivate: jest.fn(() => true),
            })
            .compile();

        controller = module.get(AuthController);
        authService = module.get(AuthService);
    });

    // register
    describe('register', () => {
        it('should register user successfully', async () => {
            const dto: RegisterDto = registerDto;

            authService.register.mockResolvedValue({
                message: 'Регистрация прошла успешно',
            });

            const result = await controller.register(dto);

            expect(result).toEqual({
                message: 'Регистрация прошла успешно',
            });
        });

        it('should throw ConflictException if user already exists', async () => {
            const dto: RegisterDto = registerDto;

            authService.register.mockRejectedValue(
                new ConflictException('USER_ALREADY_EXISTS'),
            );

            await expect(controller.register(dto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    // login
    describe('login', () => {
        it('should login user successfully', async () => {
            const dto: LoginDto = loginDto;

            // mock Response
            const response = {
                cookie: jest.fn(),
            } as unknown as Response;

            const serviceResult = {
                accessToken: 'access-token',
                userProfile,
            };

            authService.login.mockResolvedValue(serviceResult);

            const result = await controller.login(dto, response);

            // проверяем контракт
            expect(authService.login).toHaveBeenCalledWith(dto, response);
            expect(result).toEqual(serviceResult);
        });
    });

    // logout
    describe('logout', () => {
        it('should logout user successfully', async () => {
            const request = {
                cookies: {
                    refreshToken: 'valid-refresh-token',
                },
            } as never;

            const response = {
                clearCookie: jest.fn(),
            } as unknown as Response;

            authService.logout.mockResolvedValue({
                message: 'Выход выполнен успешно',
            });

            const result = await controller.logout(request, response);

            expect(authService.logout).toHaveBeenCalledWith(request, response);
            expect(result).toEqual({
                message: 'Выход выполнен успешно',
            });
        });
    });

    // refresh
    describe('refresh', () => {
        it('should refresh tokens successfully', async () => {
            const request = {
                cookies: {
                    refreshToken: 'valid-refresh-token',
                },
            } as never;

            const response = {
                cookie: jest.fn(),
            } as unknown as Response;

            const serviceResult = {
                accessToken: 'new-access-token',
                userProfile,
            };

            // мокируем сервис
            authService.refresh.mockResolvedValue(serviceResult);

            // вызываем контроллер
            const result = await controller.refresh(request, response);

            // проверяем делегирование в сервис
            expect(authService.refresh).toHaveBeenCalledWith(request, response);

            // проверяем контракт ответа
            expect(result).toEqual(serviceResult);
        });
    });
});
