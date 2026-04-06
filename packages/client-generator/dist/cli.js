#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const generate_1 = require("./generate");
/** Дефолты, если CLI вызван без `--config` */
const cliFallbackConfig = {
    repoRoot: path_1.default.resolve(__dirname, '..', '..', '..'),
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
function parseArgs(argv) {
    const out = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if ((a === '--config' || a === '-c') && argv[i + 1]) {
            out.configPath = argv[++i];
        }
    }
    return out;
}
function loadConfigFile(resolvedPath) {
    const ext = path_1.default.extname(resolvedPath).toLowerCase();
    if (ext === '.json') {
        const raw = fs_1.default.readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(raw);
    }
    if (ext === '.cjs' || ext === '.js') {
        const reqPath = require.resolve(path_1.default.resolve(resolvedPath));
        delete require.cache[reqPath];
        const m = require(reqPath);
        const cfg = m.default ?? m;
        return cfg;
    }
    throw new Error(`[client-generator] Неподдерживаемый формат конфига: ${ext}. Используйте .json, .cjs или .js (CommonJS).`);
}
function resolveRepoRoot(raw, configFilePath) {
    let repoRoot = raw.repoRoot;
    if (repoRoot === undefined || repoRoot === '') {
        throw new Error('[client-generator] В конфиге нужно указать repoRoot (абсолютный или относительно файла конфига).');
    }
    if (!path_1.default.isAbsolute(repoRoot)) {
        const base = configFilePath ? path_1.default.dirname(configFilePath) : process.cwd();
        repoRoot = path_1.default.resolve(base, repoRoot);
    }
    return repoRoot;
}
async function main() {
    const { configPath } = parseArgs(process.argv);
    let partial;
    let configFileResolved;
    if (configPath) {
        configFileResolved = path_1.default.isAbsolute(configPath) ? configPath : path_1.default.resolve(process.cwd(), configPath);
        if (!fs_1.default.existsSync(configFileResolved)) {
            console.error(`[client-generator] Файл конфига не найден: ${configFileResolved}`);
            process.exit(1);
        }
        partial = loadConfigFile(configFileResolved);
    }
    else {
        partial = { ...cliFallbackConfig };
    }
    const repoRoot = resolveRepoRoot(partial, configFileResolved);
    const cfg = (0, config_1.mergeConfig)({ ...partial, repoRoot });
    const tsConfigPath = path_1.default.join(cfg.repoRoot, cfg.backendTsconfig);
    if (!fs_1.default.existsSync(tsConfigPath)) {
        console.error(`[client-generator] Не найден tsconfig: ${tsConfigPath}`);
        process.exit(1);
    }
    const out = path_1.default.join(cfg.repoRoot, cfg.outputDir);
    await fs_1.default.promises.mkdir(out, { recursive: true });
    const result = await (0, generate_1.generate)(cfg);
    console.log(`[client-generator] Готово. Модели: ${result.modelsIndex}`);
    for (const f of result.controllerFiles) {
        console.log(`  ${path_1.default.relative(cfg.repoRoot, f)}`);
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
