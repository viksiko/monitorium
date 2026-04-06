"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInNodeModules = isInNodeModules;
exports.isBackendFile = isBackendFile;
exports.isPrismaModule = isPrismaModule;
exports.isSharedPackage = isSharedPackage;
exports.escapeRegExp = escapeRegExp;
exports.collectTypeRefNames = collectTypeRefNames;
exports.unwrapPromise = unwrapPromise;
exports.resolveStruct = resolveStruct;
exports.resolveEnum = resolveEnum;
exports.findImportOf = findImportOf;
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
// ---------------------------------------------------------------------------
// Path predicates
// ---------------------------------------------------------------------------
function toUnix(p) {
    return p.split(path_1.default.sep).join('/');
}
function isInNodeModules(filePath) {
    return toUnix(path_1.default.normalize(filePath)).includes('node_modules');
}
function isBackendFile(filePath) {
    const u = toUnix(path_1.default.normalize(filePath));
    return u.includes('/apps/backend/src/') || u.includes('/apps/backend/libs/');
}
function isPrismaModule(moduleSpecifier) {
    return moduleSpecifier === '@prisma/client' || moduleSpecifier.startsWith('@prisma/');
}
function isSharedPackage(moduleSpecifier, sharedPkg) {
    return moduleSpecifier === sharedPkg || moduleSpecifier.startsWith(`${sharedPkg}/`);
}
// ---------------------------------------------------------------------------
// AST string helpers
// ---------------------------------------------------------------------------
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/** Собирает все простые имена TypeReference из поддерева (безженериков и скобок) */
function collectTypeRefNames(node) {
    if (!node)
        return new Set();
    const out = new Set();
    const visit = (n) => {
        if (n.getKind() === ts_morph_1.SyntaxKind.TypeReference) {
            const tr = n;
            out.add(tr.getTypeName().getText().replace(/\[.*$/, '').split('<')[0].trim());
        }
        n.getChildren().forEach(visit);
    };
    visit(node);
    return out;
}
/** Снимает внешний `Promise<…>` */
function unwrapPromise(typeStr) {
    const s = typeStr.trim();
    if (!s.startsWith('Promise'))
        return s;
    const lt = s.indexOf('<');
    if (lt < 0)
        return s;
    let depth = 0;
    for (let i = lt; i < s.length; i++) {
        if (s[i] === '<')
            depth++;
        if (s[i] === '>') {
            if (--depth === 0)
                return s.slice(lt + 1, i).trim();
        }
    }
    return s;
}
// ---------------------------------------------------------------------------
// AST resolution
// ---------------------------------------------------------------------------
/** Найти class/interface по имени в файле и его импортах */
function resolveStruct(name, fromFile) {
    const local = fromFile.getClass(name) ?? fromFile.getInterface(name);
    if (local)
        return local;
    for (const decl of fromFile.getImportDeclarations()) {
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== name && alias !== name)
                continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target)
                continue;
            const found = target.getClass(orig) ?? target.getInterface(orig);
            if (found)
                return found;
        }
    }
    return undefined;
}
/** Найти enum по имени в файле и его импортах */
function resolveEnum(name, fromFile) {
    const local = fromFile.getEnum(name);
    if (local)
        return local;
    for (const decl of fromFile.getImportDeclarations()) {
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== name && alias !== name)
                continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target)
                continue;
            const e = target.getEnum(orig);
            if (e)
                return e;
        }
    }
    return undefined;
}
/** Найти импорт имени в файле (возвращает название модуля и спецификатор) */
function findImportOf(file, name) {
    for (const decl of file.getImportDeclarations()) {
        const mod = decl.getModuleSpecifierValue();
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (alias === name)
                return { module: mod, specText: spec.getText() };
            if (orig === name && !alias)
                return { module: mod, specText: orig };
        }
    }
    return undefined;
}
