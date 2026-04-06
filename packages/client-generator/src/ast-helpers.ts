import path from 'path';
import { Node, SyntaxKind, type EnumDeclaration, type SourceFile, type TypeReferenceNode } from 'ts-morph';
import type { StructDecl } from './types';

// ---------------------------------------------------------------------------
// Path predicates
// ---------------------------------------------------------------------------

function toUnix(p: string): string {
    return p.split(path.sep).join('/');
}

export function isInNodeModules(filePath: string): boolean {
    return toUnix(path.normalize(filePath)).includes('node_modules');
}

export function isBackendFile(filePath: string): boolean {
    const u = toUnix(path.normalize(filePath));
    return u.includes('/apps/backend/src/') || u.includes('/apps/backend/libs/');
}

export function isPrismaModule(moduleSpecifier: string): boolean {
    return moduleSpecifier === '@prisma/client' || moduleSpecifier.startsWith('@prisma/');
}

export function isSharedPackage(moduleSpecifier: string, sharedPkg: string): boolean {
    return moduleSpecifier === sharedPkg || moduleSpecifier.startsWith(`${sharedPkg}/`);
}

// ---------------------------------------------------------------------------
// AST string helpers
// ---------------------------------------------------------------------------

export function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Собирает все простые имена TypeReference из поддерева (безженериков и скобок) */
export function collectTypeRefNames(node: Node | undefined): Set<string> {
    if (!node) return new Set();
    const out = new Set<string>();
    const visit = (n: Node): void => {
        if (n.getKind() === SyntaxKind.TypeReference) {
            const tr = n as TypeReferenceNode;
            out.add(tr.getTypeName().getText().replace(/\[.*$/, '').split('<')[0]!.trim());
        }
        n.getChildren().forEach(visit);
    };
    visit(node);
    return out;
}

/** Снимает внешний `Promise<…>` */
export function unwrapPromise(typeStr: string): string {
    const s = typeStr.trim();
    if (!s.startsWith('Promise')) return s;
    const lt = s.indexOf('<');
    if (lt < 0) return s;
    let depth = 0;
    for (let i = lt; i < s.length; i++) {
        if (s[i] === '<') depth++;
        if (s[i] === '>') {
            if (--depth === 0) return s.slice(lt + 1, i).trim();
        }
    }
    return s;
}

// ---------------------------------------------------------------------------
// AST resolution
// ---------------------------------------------------------------------------

/** Найти class/interface по имени в файле и его импортах */
export function resolveStruct(name: string, fromFile: SourceFile): StructDecl | undefined {
    const local = fromFile.getClass(name) ?? fromFile.getInterface(name);
    if (local) return local;
    for (const decl of fromFile.getImportDeclarations()) {
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== name && alias !== name) continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target) continue;
            const found = target.getClass(orig) ?? target.getInterface(orig);
            if (found) return found;
        }
    }
    return undefined;
}

/** Найти enum по имени в файле и его импортах */
export function resolveEnum(name: string, fromFile: SourceFile): EnumDeclaration | undefined {
    const local = fromFile.getEnum(name);
    if (local) return local;
    for (const decl of fromFile.getImportDeclarations()) {
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== name && alias !== name) continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target) continue;
            const e = target.getEnum(orig);
            if (e) return e;
        }
    }
    return undefined;
}

/** Найти импорт имени в файле (возвращает название модуля и спецификатор) */
export function findImportOf(
    file: SourceFile,
    name: string,
): { module: string; specText: string } | undefined {
    for (const decl of file.getImportDeclarations()) {
        const mod = decl.getModuleSpecifierValue();
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (alias === name) return { module: mod, specText: spec.getText() };
            if (orig === name && !alias) return { module: mod, specText: orig };
        }
    }
    return undefined;
}
