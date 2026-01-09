import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from '@shared/filter';
import { TransformInterceptor } from '@shared/interceptor';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

jest.mock('uuid', () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    v4: () => 'test-uuid',
}));

describe('Health Endpoint (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.setGlobalPrefix('api');

        app.enableVersioning({
            type: VersioningType.URI,
        });

        app.useGlobalFilters(new HttpExceptionFilter());
        app.useGlobalInterceptors(new TransformInterceptor());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /api/v1/health should return 200 and correct response body', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/health')
            .expect(200)
            .expect({
                success: true,
                statusCode: 200,
                data: {
                    status: 'ok',
                    service: 'Monitorium Backend',
                },
            });
    });
});
