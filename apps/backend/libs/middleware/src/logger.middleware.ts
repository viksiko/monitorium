import { Injectable, NestMiddleware } from '@nestjs/common';
import { logger } from '@src/logger/winston.logger';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const { method, path, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const startTime = Date.now();

        // Слушаем событие завершения ответа
        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - startTime;

            logger.info(`${method} ${path} ${statusCode} - ${duration}ms`, {
                method,
                path,
                statusCode,
                duration,
                ip,
                userAgent,
            });
        });

        next();
    }
}
