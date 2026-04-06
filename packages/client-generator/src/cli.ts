#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { mergeConfig, type GeneratorConfig } from './config';
import { generate } from './generate';

/** Объединение дефолтов с путями под эту монорепу; править здесь при смене layout. */
const cliConfig: Partial<GeneratorConfig> = {
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

async function main(): Promise<void> {
    const cfg = mergeConfig({ ...cliConfig, repoRoot: cliConfig.repoRoot! });
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
