"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultGeneratorConfig = exports.defaultBuiltinTypeNames = void 0;
exports.mergeConfig = mergeConfig;
const path_1 = __importDefault(require("path"));
exports.defaultBuiltinTypeNames = new Set([
    'Promise',
    'Date',
    'Array',
    'ReadonlyArray',
    'Record',
    'Map',
    'Set',
    'Omit',
    'Pick',
    'Partial',
    'Required',
    'Readonly',
    'Exclude',
    'Extract',
    'NonNullable',
    'ReturnType',
    'Parameters',
    'Awaited',
    'HTMLElement',
    'Request',
    'Response',
]);
exports.defaultGeneratorConfig = {
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'split',
    modelSuffix: 'Model',
    strictTypes: false,
    builtinTypeNames: exports.defaultBuiltinTypeNames,
};
function mergeConfig(partial) {
    return {
        ...exports.defaultGeneratorConfig,
        ...partial,
        builtinTypeNames: partial.builtinTypeNames ?? exports.defaultBuiltinTypeNames,
        repoRoot: path_1.default.resolve(partial.repoRoot),
    };
}
