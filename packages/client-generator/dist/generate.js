"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const ast_helpers_1 = require("./ast-helpers");
const emit_client_1 = require("./emit-client");
const models_1 = require("./models");
const parse_1 = require("./parse");
async function generate(cfg) {
    const tsConfigPath = path_1.default.join(cfg.repoRoot, cfg.backendTsconfig);
    const project = new ts_morph_1.Project({ tsConfigFilePath: tsConfigPath });
    const controllers = project
        .getSourceFiles()
        .filter((sf) => sf.getFilePath().endsWith('.controller.ts') && (0, ast_helpers_1.isBackendFile)(sf.getFilePath()));
    const registry = new models_1.ModelRegistry(cfg.modelSuffix);
    const planned = [];
    for (const sf of controllers) {
        for (const cd of sf.getClasses()) {
            const dec = cd.getDecorator('Controller');
            if (!dec)
                continue;
            const ctrlMeta = (0, parse_1.parseControllerMeta)(dec);
            const endpoints = (0, parse_1.parseControllerEndpoints)(sf, cd, ctrlMeta);
            if (endpoints.length === 0)
                continue;
            for (const ep of endpoints) {
                const method = cd.getMethod(ep.methodName);
                if (!method)
                    continue;
                (0, models_1.collectModelsFromNode)(method.getReturnTypeNode(), sf, registry, cfg);
                for (const p of method.getParameters())
                    (0, models_1.collectModelsFromNode)(p.getTypeNode(), sf, registry, cfg);
            }
            planned.push({ classDecl: cd, ctrlMeta, endpoints, sf });
        }
    }
    (0, models_1.expandModels)(registry, cfg);
    const sorted = (0, models_1.topoSort)(registry);
    const enums = (0, models_1.collectEnums)(sorted, cfg);
    // ---------------------------------------------------------------------------
    // Plugin pipeline: resolveExternalTypes
    // ---------------------------------------------------------------------------
    const externalTypeAliases = new Map();
    if (cfg.plugins.length > 0) {
        const ctx = { cfg, project, sorted, externalTypeAliases };
        for (const plugin of cfg.plugins) {
            if (plugin.resolveExternalTypes) {
                await plugin.resolveExternalTypes(ctx);
            }
        }
    }
    // ---------------------------------------------------------------------------
    // Запись файлов
    // ---------------------------------------------------------------------------
    const modelsDir = path_1.default.join(cfg.repoRoot, cfg.outputDir, 'models');
    const outDir = path_1.default.join(cfg.repoRoot, cfg.outputDir);
    await promises_1.default.mkdir(outDir, { recursive: true });
    await (0, models_1.writeModels)(sorted, enums, registry, cfg, modelsDir, externalTypeAliases);
    // Plugin pipeline: afterWrite
    if (cfg.plugins.length > 0) {
        const ctx = { cfg, project, sorted, externalTypeAliases };
        for (const plugin of cfg.plugins) {
            if (plugin.afterWrite) {
                await plugin.afterWrite(outDir, cfg);
            }
        }
    }
    const controllerFiles = [];
    const barrelExports = [];
    for (const { classDecl, ctrlMeta, endpoints } of planned) {
        const name = classDecl.getName();
        const fileBase = `${(0, parse_1.toObjectName)(name)}.client.ts`;
        const filePath = path_1.default.join(outDir, fileBase);
        await promises_1.default.writeFile(filePath, (0, emit_client_1.emitClientFile)(classDecl, ctrlMeta, endpoints, registry, cfg), 'utf-8');
        controllerFiles.push(filePath);
        barrelExports.push(`export { ${(0, parse_1.toObjectName)(name)} } from './${fileBase.replace(/\.ts$/, '')}';`);
    }
    const barrel = ['/** @generated */', '', ...barrelExports.sort(), ''].join('\n');
    await promises_1.default.writeFile(path_1.default.join(outDir, 'index.ts'), barrel, 'utf-8');
    return { controllerFiles, modelsIndex: path_1.default.join(modelsDir, 'index.ts') };
}
