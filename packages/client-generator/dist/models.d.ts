import { type EnumDeclaration, type SourceFile } from 'ts-morph';
import type { GeneratorConfig } from './config';
import type { StructDecl } from './types';
/** Реестр: исходное имя (class/interface) → имя сгенерированного интерфейса */
export declare class ModelRegistry {
    private readonly suffix;
    readonly modelName: Map<string, string>;
    readonly structs: Map<string, StructDecl>;
    constructor(suffix: string | null);
    register(decl: StructDecl): void;
    has(name: string): boolean;
    /** Подставить все зарегистрированные имена в строку типа */
    mapType(text: string): string;
}
export declare function collectModelsFromNode(typeNode: import('ts-morph').Node | undefined, fromFile: SourceFile, registry: ModelRegistry, cfg: GeneratorConfig): void;
/** BFS: транзитивно добавить все вложенные типы зарегистрированных моделей */
export declare function expandModels(registry: ModelRegistry, cfg: GeneratorConfig): void;
/** Топологическая сортировка (зависимости — раньше) */
export declare function topoSort(registry: ModelRegistry): StructDecl[];
export declare function collectEnums(sorted: StructDecl[], cfg: GeneratorConfig): EnumDeclaration[];
export declare function buildBundleContent(sorted: StructDecl[], enums: EnumDeclaration[], registry: ModelRegistry, cfg: GeneratorConfig, externalTypeAliases?: ReadonlyMap<string, string[]>): string;
export declare function writeModels(sorted: StructDecl[], enums: EnumDeclaration[], registry: ModelRegistry, cfg: GeneratorConfig, modelsDir: string, externalTypeAliases?: ReadonlyMap<string, string[]>): Promise<void>;
