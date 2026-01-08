import {
    ExecutionContext,
    INestApplication,
    ValidationPipe,
    VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HttpExceptionFilter } from '@shared/filter';
import { TransformInterceptor } from '@shared/interceptor';
import { AppModule } from '@src/app.module';
import * as cookieParser from 'cookie-parser';

export async function createTestApp({
    mockAuth = false,
}: {
    mockAuth?: boolean;
}): Promise<INestApplication<unknown>> {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    app.use(cookieParser());

    if (mockAuth) {
        app.useGlobalGuards({
            canActivate: (ctx: ExecutionContext) => {
                const req = ctx.switchToHttp().getRequest();
                req.user = { id: 'test', role: 'ADMIN' };
                return true;
            },
        });
    }

    await app.init();
    return app;
}
