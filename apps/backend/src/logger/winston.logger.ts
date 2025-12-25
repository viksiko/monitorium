import * as path from 'path';
import * as winston from 'winston';

const logDir = path.join(__dirname, '../logs');

// Создаем форматтер для логов
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
        // Создаём объект в нужном порядке
        const log = {
            timestamp: info.timestamp,
            service: info.service,
            statusCode: info.statusCode,
            level: info.level,
            category: info.category,
            operation: info.operation,
            message: info.message,
            method: info.method,
            path: info.path,
            duration: info.duration,
            ip: info.ip,
            userAgent: info.userAgent,
        };

        return JSON.stringify(log);
    }),
);

// Создаем логгер
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'monitorium-backend' },
    transports: [
        new winston.transports.Console({
            level: 'error',
            format: winston.format((error) => {
                if (error.level !== 'error') return false;
                return error;
            })(),
        }),

        new winston.transports.Console({
            level: 'warn',
            format: winston.format((warn) => {
                if (warn.level !== 'warn') return false;
                return warn;
            })(),
        }),

        new winston.transports.Console({
            level: 'info', // транспорт ловит info и выше (но фильтр ниже)
            format: winston.format((info) => {
                if (info.level !== 'info') return false; // пропускаем всё кроме info
                return info;
            })(),
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: winston.format((error) => {
                if (error.level !== 'error') return false;
                return error;
            })(),
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'warn.log'),
            level: 'warn',
            format: winston.format((warn) => {
                if (warn.level !== 'warn') return false;
                return warn;
            })(),
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'info.log'),
            level: 'info',
            format: winston.format((info) => {
                // пропускаем warn и error
                if (info.level !== 'info') return false;
                return info;
            })(),
        }),
    ],
});

// // В development режиме также выводим в консоль
// if (process.env.NODE_ENV !== 'production') {
//     logger.add(
//         new winston.transports.Console({
//             format: winston.format.combine(
//                 winston.format.colorize(),
//                 winston.format.simple(),
//             ),
//         }),
//     );
// }

// Level	Приоритет (0 = highest)
// error	0	Критическая ошибка, нужно вмешательство
// warn	    1	Предупреждение, потенциальная проблема
// info	    2	Информация о работе приложения
// http	    3	HTTP-запросы (обычно кастомный уровень)
// verbose	4	Подробная информация для отладки
// debug	5	Детальная отладочная информация
// silly	6	Максимально подробные логи, почти все
