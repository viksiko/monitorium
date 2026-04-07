/**
 * Конфиг @monorepo/client-generator.
 * Запуск: из корня монорепы `npm run api:generate` (путь к файлу передаётся в npm-скрипте).
 * Пути ниже относительны к каталогу этого файла, кроме полей, которые задаются относительно repoRoot.
 */
const path = require('path');

/** Корень монорепозитория (четыре уровня вверх от src/lib) */
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

module.exports = {
    repoRoot,
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'split',
    modelSuffix: 'Model',
    strictTypes: false,
    /**
     * Плагины pipeline генератора.
     * Встроенные плагины указываются строкой:
     *   'prisma' — дублирует Prisma enum-типы во фронтенд без зависимости на @prisma/client.
     *              Читает значения из сгенерированного @prisma/client .d.ts (точные значения с @map),
     *              при недоступности — fallback на apps/backend/prisma/schema.prisma.
     *
     * Для кастомных плагинов можно передать объект { name, resolveExternalTypes?, afterWrite? }.
     */
    plugins: ['prisma'],
};
