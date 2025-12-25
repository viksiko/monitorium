// http-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { logger } from '@src/logger/winston.logger';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status: number;
        let message: string | string[];

        // ================= HTTP EXCEPTIONS =================
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                message =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (exceptionResponse as any).message ?? exception.message;
            } else {
                message = exception.message;
            }
        }
        // ================= PRISMA / DATABASE ERRORS =================
        else if (this.isPrismaError(exception)) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error PRISMA';
        }
        // ================= OTHER ERRORS =================
        else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error OTHER';

            logger.error('Unhandled error', {
                name: exception.name,
                message: exception.message,
                stack:
                    process.env.NODE_ENV === 'development'
                        ? exception.stack
                        : undefined,
            });
        }
        // ================= UNKNOWN ERRORS =================
        else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error UNKNOWN';

            logger.error('Unknown error type', { exception });
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            data: { message },
        });
    }

    private isPrismaError(error: unknown): boolean | undefined {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError ||
            error instanceof Prisma.PrismaClientUnknownRequestError ||
            error instanceof Prisma.PrismaClientInitializationError ||
            error instanceof Prisma.PrismaClientRustPanicError ||
            error instanceof Prisma.PrismaClientValidationError ||
            // Дополнительная проверка по имени класса на случай проблем с импортом
            error?.constructor?.name?.includes('Prisma')
        );
    }
}
