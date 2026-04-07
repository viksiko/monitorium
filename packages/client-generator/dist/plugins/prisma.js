"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaPlugin = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const ast_helpers_1 = require("../ast-helpers");
// ---------------------------------------------------------------------------
// Разрешение через @prisma/client .d.ts (первичный способ)
// ---------------------------------------------------------------------------
/**
 * Prisma генерирует в .d.ts паттерн:
 *   export declare const Role: { readonly ADMIN: "ADMIN"; readonly USER: "USER"; };
 *
 * Читаем через ts-morph: getVariableDeclaration → TypeLiteral → PropertySignature → StringLiteral
 */
function extractStringLiteralsFromTypeLiteral(typeNode) {
    if (!typeNode || !ts_morph_1.Node.isTypeLiteral(typeNode))
        return [];
    const values = [];
    for (const member of typeNode.getMembers()) {
        if (!ts_morph_1.Node.isPropertySignature(member))
            continue;
        const mType = member.getTypeNode();
        if (mType?.getKind() === ts_morph_1.SyntaxKind.LiteralType) {
            const literal = mType.getFirstChildByKind(ts_morph_1.SyntaxKind.StringLiteral);
            if (literal)
                values.push(literal.getLiteralText());
        }
    }
    return values;
}
function findPrismaEnumValuesFromDts(typeName, fromFile) {
    for (const decl of fromFile.getImportDeclarations()) {
        if (!(0, ast_helpers_1.isPrismaModule)(decl.getModuleSpecifierValue()))
            continue;
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== typeName && alias !== typeName)
                continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target)
                continue;
            const varDecl = target.getVariableDeclaration(orig);
            const values = extractStringLiteralsFromTypeLiteral(varDecl?.getTypeNode());
            if (values.length > 0)
                return values;
        }
    }
    return [];
}
// ---------------------------------------------------------------------------
// Fallback: парсинг schema.prisma
// ---------------------------------------------------------------------------
/**
 * Читает `enum Foo { A B C }` из schema.prisma.
 * Используется как запасной вариант, если ts-morph не смог разрешить .d.ts
 * (например, @prisma/client ещё не сгенерирован или имеет нестандартную структуру).
 *
 * Важно: не учитывает `@map(...)`, поэтому реальные строковые значения могут
 * отличаться от имён членов enum. Для корректных значений используйте .d.ts.
 */
function parsePrismaEnumsFromSchema(schemaText) {
    const out = new Map();
    const enumRegex = /enum\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}/g;
    let match;
    while ((match = enumRegex.exec(schemaText)) !== null) {
        const enumName = match[1];
        const body = match[2] ?? '';
        const values = [];
        for (const rawLine of body.split('\n')) {
            const line = rawLine.split('//')[0].trim();
            if (!line)
                continue;
            const value = line.split(/\s+/)[0];
            if (/^[A-Za-z_]\w*$/.test(value))
                values.push(value);
        }
        if (values.length > 0)
            out.set(enumName, values);
    }
    return out;
}
// ---------------------------------------------------------------------------
// Плагин
// ---------------------------------------------------------------------------
/**
 * Встроенный плагин для Prisma.
 *
 * Стратегия разрешения (для каждого типа, импортированного из @prisma/*):
 * 1. Читает значения из сгенерированного `@prisma/client` `.d.ts` через ts-morph.
 *    Это даёт точные строковые значения с учётом `@@map`.
 * 2. Если ts-morph не смог разрешить (клиент не сгенерирован) — парсит
 *    `apps/backend/prisma/schema.prisma` как запасной вариант.
 *
 * Активация в конфиге:
 *   plugins: ['prisma']           // строковый псевдоним
 *   plugins: [prismaPlugin]       // объект напрямую
 */
exports.prismaPlugin = {
    name: 'prisma',
    async resolveExternalTypes(ctx) {
        // Шаг 1: собрать все имена, импортированные из @prisma/* в моделях
        const needed = new Map();
        for (const decl of ctx.sorted) {
            const file = decl.getSourceFile();
            for (const prop of decl.getProperties()) {
                for (const ref of (0, ast_helpers_1.collectTypeRefNames)(prop.getTypeNode())) {
                    if (ctx.externalTypeAliases.has(ref))
                        continue;
                    const imp = (0, ast_helpers_1.findImportOf)(file, ref);
                    if (imp && (0, ast_helpers_1.isPrismaModule)(imp.module)) {
                        needed.set(ref, file);
                    }
                }
            }
        }
        if (needed.size === 0)
            return;
        // Шаг 2: пытаемся разрешить через @prisma/client .d.ts
        const unresolved = new Set();
        for (const [name, file] of needed) {
            const values = findPrismaEnumValuesFromDts(name, file);
            if (values.length > 0) {
                ctx.externalTypeAliases.set(name, values);
            }
            else {
                unresolved.add(name);
            }
        }
        if (unresolved.size === 0)
            return;
        // Шаг 3: fallback — schema.prisma
        const schemaPath = path_1.default.join(ctx.cfg.repoRoot, 'apps/backend/prisma/schema.prisma');
        const schemaText = await promises_1.default.readFile(schemaPath, 'utf-8').catch(() => '');
        if (!schemaText)
            return;
        const schemaEnums = parsePrismaEnumsFromSchema(schemaText);
        for (const name of unresolved) {
            const values = schemaEnums.get(name);
            if (values && values.length > 0) {
                ctx.externalTypeAliases.set(name, values);
            }
        }
    },
};
