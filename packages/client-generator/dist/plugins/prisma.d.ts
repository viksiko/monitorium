import type { GeneratorPlugin } from '../config';
/**
 * Встроенный плагин для Prisma.
 *
 * Стратегия разрешения (для каждого типа, импортированного из @prisma/*):
 * 1. Читает значения из сгенерированного `@prisma/client` `.d.ts` через ts-morph.
 *    Это даёт точные строковые значения с учётом `@@map`.
 * 2. Если ts-morph не смог разрешить (клиент не сгенерирован) — парсит
 *    `apps/backend/prisma/schema.prisma` как запасной вариант.
 *
 * Активация в конфиге:
 *   plugins: ['prisma']           // строковый псевдоним
 *   plugins: [prismaPlugin]       // объект напрямую
 */
export declare const prismaPlugin: GeneratorPlugin;
