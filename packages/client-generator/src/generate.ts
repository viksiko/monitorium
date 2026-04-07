import fs from 'fs/promises';
import path from 'path';
import { Project } from 'ts-morph';
import type { ExternalTypesCtx, GeneratorConfig } from './config';
import { isBackendFile } from './ast-helpers';
import { emitClientFile } from './emit-client';
import { ModelRegistry, collectEnums, collectModelsFromNode, expandModels, topoSort, writeModels } from './models';
import { parseControllerEndpoints, parseControllerMeta, toObjectName } from './parse';

export interface GenerateResult {
    controllerFiles: string[];
    modelsIndex: string;
}

export async function generate(cfg: GeneratorConfig): Promise<GenerateResult> {
    const tsConfigPath = path.join(cfg.repoRoot, cfg.backendTsconfig);
    const project = new Project({ tsConfigFilePath: tsConfigPath });

    const controllers = project
        .getSourceFiles()
        .filter((sf) => sf.getFilePath().endsWith('.controller.ts') && isBackendFile(sf.getFilePath()));

    const registry = new ModelRegistry(cfg.modelSuffix);

    const planned: {
        classDecl: import('ts-morph').ClassDeclaration;
        ctrlMeta: import('./types').ControllerMeta;
        endpoints: import('./types').ParsedEndpoint[];
        sf: import('ts-morph').SourceFile;
    }[] = [];

    for (const sf of controllers) {
        for (const cd of sf.getClasses()) {
            const dec = cd.getDecorator('Controller');
            if (!dec) continue;
            const ctrlMeta = parseControllerMeta(dec);
            const endpoints = parseControllerEndpoints(sf, cd, ctrlMeta);
            if (endpoints.length === 0) continue;

            for (const ep of endpoints) {
                const method = cd.getMethod(ep.methodName);
                if (!method) continue;
                collectModelsFromNode(method.getReturnTypeNode(), sf, registry, cfg);
                for (const p of method.getParameters()) collectModelsFromNode(p.getTypeNode(), sf, registry, cfg);
            }

            planned.push({ classDecl: cd, ctrlMeta, endpoints, sf });
        }
    }

    expandModels(registry, cfg);

    const sorted = topoSort(registry);
    const enums = collectEnums(sorted, cfg);

    // ---------------------------------------------------------------------------
    // Plugin pipeline: resolveExternalTypes
    // ---------------------------------------------------------------------------
    const externalTypeAliases = new Map<string, string[]>();

    if (cfg.plugins.length > 0) {
        const ctx: ExternalTypesCtx = { cfg, project, sorted, externalTypeAliases };
        for (const plugin of cfg.plugins) {
            if (plugin.resolveExternalTypes) {
                await plugin.resolveExternalTypes(ctx);
            }
        }
    }

    // ---------------------------------------------------------------------------
    // Запись файлов
    // ---------------------------------------------------------------------------
    const modelsDir = path.join(cfg.repoRoot, cfg.outputDir, 'models');
    const outDir = path.join(cfg.repoRoot, cfg.outputDir);
    await fs.mkdir(outDir, { recursive: true });
    await writeModels(sorted, enums, registry, cfg, modelsDir, externalTypeAliases);

    // Plugin pipeline: afterWrite
    if (cfg.plugins.length > 0) {
        const ctx: ExternalTypesCtx = { cfg, project, sorted, externalTypeAliases };
        for (const plugin of cfg.plugins) {
            if (plugin.afterWrite) {
                await plugin.afterWrite(outDir, cfg);
            }
        }
    }

    const controllerFiles: string[] = [];
    const barrelExports: string[] = [];

    for (const { classDecl, ctrlMeta, endpoints } of planned) {
        const name = classDecl.getName()!;
        const fileBase = `${toObjectName(name)}.client.ts`;
        const filePath = path.join(outDir, fileBase);
        await fs.writeFile(filePath, emitClientFile(classDecl, ctrlMeta, endpoints, registry, cfg), 'utf-8');
        controllerFiles.push(filePath);
        barrelExports.push(`export { ${toObjectName(name)} } from './${fileBase.replace(/\.ts$/, '')}';`);
    }

    const barrel = ['/** @generated */', '', ...barrelExports.sort(), ''].join('\n');
    await fs.writeFile(path.join(outDir, 'index.ts'), barrel, 'utf-8');

    return { controllerFiles, modelsIndex: path.join(modelsDir, 'index.ts') };
}
