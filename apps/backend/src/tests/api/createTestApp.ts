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
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import * as cookieParser from 'cookie-parser';

export async function createTestApp({
    mockAuth = false,
}: {
    mockAuth?: boolean;
}): Promise<INestApplication<unknown>> {
    const builder = Test.createTestingModule({
        imports: [AppModule],
    });

    if (mockAuth) {
        builder.overrideGuard(JwtAuthGuard).useValue({
            canActivate: () => true,
        });
    }

    const moduleFixture = await builder.compile();

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
