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
/** Объединение дефолтов с путями под эту монорепу; править здесь при смене layout. */
const cliConfig = {
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
async function main() {
    const cfg = (0, config_1.mergeConfig)({ ...cliConfig, repoRoot: cliConfig.repoRoot });
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
