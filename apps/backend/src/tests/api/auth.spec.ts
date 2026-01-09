import { INestApplication } from '@nestjs/common';
import { TOKEN_INVALID_RES } from '@src/constants/api-responses.swagger';
import * as request from 'supertest';
import { createTestApp } from './createTestApp';

jest.mock('uuid', () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    v4: () => 'test-uuid',
}));

describe('Auth Endpoint (e2e) – not auth', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp({ mockAuth: false });
    });

    afterAll(async () => {
        await app.close();
    });

    // api/v1/auth/register
    it('POST /api/v1/auth/register should return 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                name: 'userTest1750200548',
                email: 'user555@testuserTest1750200548.test',
                password: 'passw',
            })
            .expect(400)
            .expect({
                success: false,
                statusCode: 400,
                data: {
                    message: [
                        'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                        'Пароль должен быть не менее 8 символов',
                        'Телефон не может быть пустым',
                        'Телефон должен состоять ровно из 11 символов',
                        'Телефон должно быть строкой',
                    ],
                },
            });
    });

    // api/v1/auth/login
    it('POST /api/v1/auth/login should return 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'user555@testuserTest1750200548.test',
            })
            .expect(400)
            .expect({
                success: false,
                statusCode: 400,
                data: {
                    message: [
                        'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                        'Пароль не может быть пустым',
                        'Пароль должен быть не более 50 символов',
                        'Пароль должен быть не менее 8 символов',
                        'Пароль должно быть строкой',
                    ],
                },
            });
    });

    // api/v1/auth/refresh
    it('POST /api/v1/auth/refresh should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/refresh')
            .set('Cookie', ['refreshToken=invalid_refresh_token'])
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    // api/v1/auth/logout
    it('POST /api/v1/auth/logout should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/logout')
            .set('Cookie', ['refreshToken=invalid_refresh_token'])
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    // api/v1/auth/forgot-password
    it('POST /api/v1/auth/forgot-password should return 201 when body is valid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/forgot-password')
            .send({
                email: 'user555@testuserTest1750200548.test',
            })
            .expect(201)
            .expect({
                success: true,
                statusCode: 201,
                data: {
                    message:
                        'Если адрес указан верно, письмо с инструкцией по сбросу паролям придет в течение нескольких минут.',
                },
            });
    });

    it('POST /api/v1/auth/forgot-password should return 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/forgot-password')
            .send({})
            .expect(400)
            .expect({
                success: false,
                statusCode: 400,
                data: {
                    message: [
                        'Email не может быть пустым',
                        'Email должен быть не более 50 символов',
                        'Некорректный email',
                    ],
                },
            });
    });

    // api/v1/auth/reset-password
    it('POST /api/v1/auth/reset-password should return 400 when body is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/reset-password')
            .send({})
            .expect(400)
            .expect({
                success: false,
                statusCode: 400,
                data: {
                    message: [
                        'Токен не должен быть пустым',
                        'Токен должен быть строкой',
                        'Пароль должен содержать минимум 8 символов, одну заглавную букву, одну цифру и один специальный символ',
                        'Пароль не может быть пустым',
                        'Пароль должен быть не более 50 символов',
                        'Пароль должен быть не менее 8 символов',
                        'Пароль должно быть строкой',
                    ],
                },
            });
    });

    it('POST /api/v1/auth/reset-password should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/reset-password')
            .send({
                token: 'invalid_reset_password_token',
                password: 'NewPassword123!',
            })
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    // api/v1/auth/confirm
    it('GET /api/v1/auth/confirm should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/auth/confirm')
            .set('Cookie', ['refreshToken=invalid_refresh_token'])
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });
});
