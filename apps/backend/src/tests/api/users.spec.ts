import { INestApplication } from '@nestjs/common';
import {
    TOKEN_INVALID_RES,
    USER_NOT_AUTHORIZED_RES,
} from '@src/constants/api-responses.swagger';
import { UserResponse } from '@src/types/user';
import * as request from 'supertest';
import { createTestApp } from './createTestApp';

jest.mock('uuid', () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    v4: () => 'test-uuid',
}));

describe('Users Endpoint (e2e) – auth', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp({ mockAuth: true });
    });

    afterAll(async () => {
        await app.close();
    });

    // api/v1/users
    it('GET /api/v1/users', async () => {
        const response = await request(app.getHttpServer()).get(
            '/api/v1/users',
        );

        // Проверяем структуру ответа
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('statusCode', 200);
        expect(response.body).toHaveProperty('data');

        // Проверяем структуру каждого пользователя
        response.body.data.forEach((user: UserResponse) => {
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('role');
        });

        // Проверяем успешный статус
        expect(response.status).toBe(200);
    });

    // api/v1/users/{id}
    const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

    it('GET /api/v1/users/:id', async () => {
        const response = await request(app.getHttpServer()).get(
            `/api/v1/users/${TEST_USER_ID}`,
        );
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('statusCode', 200);
        expect(response.body).toHaveProperty('data');
    });

    it('GET /api/v1/users/:id returns null when user does not exist', async () => {
        const notExistingUserId = '00000000-0000-0000-0000-000000000000';

        await request(app.getHttpServer())
            .get(`/api/v1/users/${notExistingUserId}`)
            .expect(200)
            .expect({
                success: true,
                statusCode: 200,
                data: null,
            });
    });
});

describe('Users Endpoint (e2e) – not auth', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp({ mockAuth: false });
    });

    afterAll(async () => {
        await app.close();
    });

    // api/v1/users
    it('GET /api/v1/users should return 401 when token is invalid', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/users')
            .set('Authorization', 'Bearer invalid_token_access')
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    it('GET /api/v1/users should return 401 when authorization header is missing', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/users')
            .expect(401)
            .expect(USER_NOT_AUTHORIZED_RES);
    });

    // api/v1/users/{id}
    it('GET /api/v1/users/:id should return 401 when token is invalid', async () => {
        const notExistingUserId = '00000000-0000-0000-0000-000000000000';

        await request(app.getHttpServer())
            .get(`/api/v1/users/${notExistingUserId}`)
            .set('Authorization', 'Bearer invalid_token_access')
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    it('GET /api/v1/users/:id should return 401 when authorization header is missing', async () => {
        const notExistingUserId = '00000000-0000-0000-0000-000000000000';

        await request(app.getHttpServer())
            .get(`/api/v1/users/${notExistingUserId}`)
            .expect(401)
            .expect(USER_NOT_AUTHORIZED_RES);
    });

    // api/v1/users/{id}/deactivate
    it('POST /api/v1/users/{id}/deactivate should return 401 when token is invalid', async () => {
        const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

        await request(app.getHttpServer())
            .patch(`/api/v1/users/${TEST_USER_ID}/deactivate`)
            .set('Authorization', 'Bearer invalid_token_access')
            .expect(401)
            .expect(TOKEN_INVALID_RES);
    });

    it('POST /api/v1/users/{id}/deactivate should return 401 when authorization header is missing', async () => {
        const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

        await request(app.getHttpServer())
            .patch(`/api/v1/users/${TEST_USER_ID}/deactivate`)
            .expect(401)
            .expect(USER_NOT_AUTHORIZED_RES);
    });
});
