import { Node, type EnumDeclaration, type SourceFile } from 'ts-morph';
import type { StructDecl } from './types';
export declare function isInNodeModules(filePath: string): boolean;
export declare function isBackendFile(filePath: string): boolean;
export declare function isPrismaModule(moduleSpecifier: string): boolean;
export declare function isSharedPackage(moduleSpecifier: string, sharedPkg: string): boolean;
export declare function escapeRegExp(s: string): string;
/** Собирает все простые имена TypeReference из поддерева (безженериков и скобок) */
export declare function collectTypeRefNames(node: Node | undefined): Set<string>;
/** Снимает внешний `Promise<…>` */
export declare function unwrapPromise(typeStr: string): string;
/** Найти class/interface по имени в файле и его импортах */
export declare function resolveStruct(name: string, fromFile: SourceFile): StructDecl | undefined;
/** Найти enum по имени в файле и его импортах */
export declare function resolveEnum(name: string, fromFile: SourceFile): EnumDeclaration | undefined;
/** Найти импорт имени в файле (возвращает название модуля и спецификатор) */
export declare function findImportOf(file: SourceFile, name: string): {
    module: string;
    specText: string;
} | undefined;
