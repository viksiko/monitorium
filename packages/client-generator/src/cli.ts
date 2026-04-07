#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { mergeConfig, type GeneratorConfig, type GeneratorPlugin } from './config';
import { generate } from './generate';
import { prismaPlugin } from './plugins/prisma';

/** Встроенные плагины, доступные по строковому имени в конфиге */
const BUILTIN_PLUGINS: Record<string, GeneratorPlugin> = {
    prisma: prismaPlugin,
};

type FileConfig = Omit<Partial<GeneratorConfig>, 'plugins'> & {
    repoRoot?: string;
    /** Плагины: строка-псевдоним встроенного плагина или объект GeneratorPlugin */
    plugins?: (string | GeneratorPlugin)[];
};

/** Дефолты, если CLI вызван без `--config` */
const cliFallbackConfig: FileConfig & { repoRoot: string } = {
    repoRoot: path.resolve(__dirname, '..', '..', '..'),
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'bundle',
    modelSuffix: 'Model',
    strictTypes: false,
};

function parseArgs(argv: string[]): { configPath?: string } {
    const out: { configPath?: string } = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if ((a === '--config' || a === '-c') && argv[i + 1]) {
            out.configPath = argv[++i];
        }
    }
    return out;
}

function loadConfigFile(resolvedPath: string): FileConfig {
    const ext = path.extname(resolvedPath).toLowerCase();
    if (ext === '.json') {
        const raw = fs.readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(raw) as FileConfig;
    }
    if (ext === '.cjs' || ext === '.js') {
        const reqPath = require.resolve(path.resolve(resolvedPath));
        delete require.cache[reqPath];
        const m = require(reqPath) as FileConfig | { default: FileConfig };
        const cfg = (m as { default?: FileConfig }).default ?? m;
        return cfg as FileConfig;
    }
    throw new Error(
        `[client-generator] Неподдерживаемый формат конфига: ${ext}. Используйте .json, .cjs или .js (CommonJS).`,
    );
}

function resolveRepoRoot(raw: FileConfig, configFilePath: string | undefined): string {
    let repoRoot = raw.repoRoot;
    if (repoRoot === undefined || repoRoot === '') {
        throw new Error('[client-generator] В конфиге нужно указать repoRoot (абсолютный или относительно файла конфига).');
    }
    if (!path.isAbsolute(repoRoot)) {
        const base = configFilePath ? path.dirname(configFilePath) : process.cwd();
        repoRoot = path.resolve(base, repoRoot);
    }
    return repoRoot;
}

/**
 * Разрешает массив плагинов из конфига:
 * - строка → встроенный плагин из BUILTIN_PLUGINS
 * - объект → используется как есть
 */
function resolvePlugins(raw: (string | GeneratorPlugin)[] | undefined): GeneratorPlugin[] {
    if (!raw || raw.length === 0) return [];
    return raw.map((p) => {
        if (typeof p === 'string') {
            const builtin = BUILTIN_PLUGINS[p];
            if (!builtin) {
                throw new Error(
                    `[client-generator] Неизвестный плагин: "${p}". Доступные встроенные плагины: ${Object.keys(BUILTIN_PLUGINS).join(', ')}.`,
                );
            }
            return builtin;
        }
        return p;
    });
}

async function main(): Promise<void> {
    const { configPath } = parseArgs(process.argv);

    let partial: FileConfig;
    let configFileResolved: string | undefined;

    if (configPath) {
        configFileResolved = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
        if (!fs.existsSync(configFileResolved)) {
            console.error(`[client-generator] Файл конфига не найден: ${configFileResolved}`);
            process.exit(1);
        }
        partial = loadConfigFile(configFileResolved);
    } else {
        partial = { ...cliFallbackConfig };
    }

    const repoRoot = resolveRepoRoot(partial, configFileResolved);
    const plugins = resolvePlugins(partial.plugins);
    const cfg = mergeConfig({
        ...(partial as Partial<GeneratorConfig>),
        repoRoot,
        plugins,
    });

    const tsConfigPath = path.join(cfg.repoRoot, cfg.backendTsconfig);
    if (!fs.existsSync(tsConfigPath)) {
        console.error(`[client-generator] Не найден tsconfig: ${tsConfigPath}`);
        process.exit(1);
    }
    const out = path.join(cfg.repoRoot, cfg.outputDir);
    await fs.promises.mkdir(out, { recursive: true });
    const result = await generate(cfg);
    console.log(`[client-generator] Готово. Модели: ${result.modelsIndex}`);
    for (const f of result.controllerFiles) {
        console.log(`  ${path.relative(cfg.repoRoot, f)}`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
