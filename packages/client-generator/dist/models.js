"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRegistry = void 0;
exports.collectModelsFromNode = collectModelsFromNode;
exports.expandModels = expandModels;
exports.topoSort = topoSort;
exports.collectEnums = collectEnums;
exports.buildBundleContent = buildBundleContent;
exports.writeModels = writeModels;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const ast_helpers_1 = require("./ast-helpers");
// ---------------------------------------------------------------------------
// ModelRegistry
// ---------------------------------------------------------------------------
/** Реестр: исходное имя (class/interface) → имя сгенерированного интерфейса */
class ModelRegistry {
    constructor(suffix) {
        this.suffix = suffix;
        this.modelName = new Map();
        this.structs = new Map();
    }
    register(decl) {
        const n = decl.getName();
        if (!n || this.modelName.has(n))
            return;
        const emitted = this.suffix ? `${n}${this.suffix}` : n;
        this.modelName.set(n, emitted);
        this.structs.set(n, decl);
    }
    has(name) {
        return this.modelName.has(name);
    }
    /** Подставить все зарегистрированные имена в строку типа */
    mapType(text) {
        let out = text;
        for (const [orig, mapped] of [...this.modelName.entries()].sort((a, b) => b[0].length - a[0].length)) {
            out = out.replace(new RegExp(`\\b${(0, ast_helpers_1.escapeRegExp)(orig)}\\b`, 'g'), mapped);
        }
        return out;
    }
}
exports.ModelRegistry = ModelRegistry;
// ---------------------------------------------------------------------------
// Сбор моделей из типов
// ---------------------------------------------------------------------------
function needsModel(decl, cfg) {
    const fp = decl.getSourceFile().getFilePath();
    if (!(0, ast_helpers_1.isBackendFile)(fp))
        return false;
    const n = decl.getName() ?? '';
    if (ts_morph_1.Node.isClassDeclaration(decl) && /Controller|Service|Module|Guard/.test(n))
        return false;
    return true;
}
function collectModelsFromNode(typeNode, fromFile, registry, cfg) {
    if (!typeNode)
        return;
    for (const n of (0, ast_helpers_1.collectTypeRefNames)(typeNode)) {
        if (cfg.builtinTypeNames.has(n))
            continue;
        const st = (0, ast_helpers_1.resolveStruct)(n, fromFile);
        if (st && needsModel(st, cfg))
            registry.register(st);
    }
}
/** BFS: транзитивно добавить все вложенные типы зарегистрированных моделей */
function expandModels(registry, cfg) {
    const queue = [...registry.structs.values()];
    for (let i = 0; i < queue.length; i++) {
        const decl = queue[i];
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            for (const n of (0, ast_helpers_1.collectTypeRefNames)(t)) {
                if (cfg.builtinTypeNames.has(n) || registry.has(n))
                    continue;
                const inner = (0, ast_helpers_1.resolveStruct)(n, decl.getSourceFile());
                if (inner && needsModel(inner, cfg)) {
                    registry.register(inner);
                    queue.push(inner);
                }
            }
        }
    }
}
/** Топологическая сортировка (зависимости — раньше) */
function topoSort(registry) {
    const edges = new Map();
    for (const [n, decl] of registry.structs) {
        edges.set(n, new Set());
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            for (const ref of (0, ast_helpers_1.collectTypeRefNames)(t)) {
                if (registry.has(ref) && ref !== n)
                    edges.get(n).add(ref);
            }
        }
    }
    const result = [];
    const perm = new Set();
    const temp = new Set();
    const visit = (n) => {
        if (perm.has(n) || temp.has(n))
            return;
        temp.add(n);
        for (const dep of edges.get(n) ?? [])
            visit(dep);
        temp.delete(n);
        perm.add(n);
        const st = registry.structs.get(n);
        if (st)
            result.push(st);
    };
    for (const n of registry.structs.keys())
        visit(n);
    return result;
}
// ---------------------------------------------------------------------------
// Enum сбор
// ---------------------------------------------------------------------------
function collectEnums(sorted, cfg) {
    const byName = new Map();
    for (const decl of sorted) {
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            for (const r of (0, ast_helpers_1.collectTypeRefNames)(t)) {
                const en = (0, ast_helpers_1.resolveEnum)(r, decl.getSourceFile());
                if (!en)
                    continue;
                const fp = en.getSourceFile().getFilePath();
                if (!(0, ast_helpers_1.isBackendFile)(fp) || (0, ast_helpers_1.isInNodeModules)(fp))
                    continue;
                const n = en.getName();
                if (n && !byName.has(n))
                    byName.set(n, en);
            }
        }
    }
    return [...byName.values()];
}
// ---------------------------------------------------------------------------
// Генерация исходника одного интерфейса
// ---------------------------------------------------------------------------
function buildInterfaceSrc(decl, registry, cfg) {
    const iface = registry.modelName.get(decl.getName());
    if (!iface)
        return '';
    const lines = [`export interface ${iface} {`];
    for (const prop of decl.getProperties()) {
        const opt = prop.hasQuestionToken() ? '?' : '';
        let mapped = registry.mapType(prop.getTypeNode()?.getText() ?? 'unknown');
        for (const r of (0, ast_helpers_1.collectTypeRefNames)(prop.getTypeNode())) {
            const resolved = (0, ast_helpers_1.resolveStruct)(r, decl.getSourceFile());
            const externalFile = resolved?.getSourceFile().getFilePath();
            const prismaByImport = !resolved && (0, ast_helpers_1.isPrismaModule)((0, ast_helpers_1.findImportOf)(decl.getSourceFile(), r)?.module ?? '');
            if ((externalFile && (0, ast_helpers_1.isInNodeModules)(externalFile)) || prismaByImport) {
                if (cfg.strictTypes)
                    throw new Error(`[client-generator] Внешний тип "${r}" в ${decl.getName()}.${prop.getName()} (strictTypes=true)`);
                mapped = mapped.replace(new RegExp(`\\b${(0, ast_helpers_1.escapeRegExp)(r)}\\b`, 'g'), 'unknown');
            }
        }
        lines.push(`  ${prop.getName()}${opt}: ${mapped};`);
    }
    lines.push('}');
    return lines.join('\n');
}
function enumSrc(e) {
    const text = e.getText().trim();
    return text.startsWith('export') ? text : `export ${text}`;
}
/** Собрать `import type` из shared-пакета для полей структуры */
function sharedImportsForStruct(decl, cfg) {
    const out = new Map();
    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t)
            continue;
        for (const name of (0, ast_helpers_1.collectTypeRefNames)(t)) {
            if (cfg.builtinTypeNames.has(name))
                continue;
            const imp = (0, ast_helpers_1.findImportOf)(decl.getSourceFile(), name);
            if (imp && (0, ast_helpers_1.isSharedPackage)(imp.module, cfg.sharedTypesPackage)) {
                if (!out.has(imp.module))
                    out.set(imp.module, new Set());
                out.get(imp.module).add(imp.specText);
            }
        }
    }
    return out;
}
function sharedImportLines(shared) {
    return [...shared.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mod, set]) => `import type { ${[...set].sort().join(', ')} } from '${mod}';`);
}
// ---------------------------------------------------------------------------
// Запись моделей (bundle)
// ---------------------------------------------------------------------------
function buildBundleContent(sorted, enums, registry, cfg) {
    const shared = new Map();
    for (const decl of sorted) {
        for (const [mod, set] of sharedImportsForStruct(decl, cfg)) {
            if (!shared.has(mod))
                shared.set(mod, new Set());
            for (const s of set)
                shared.get(mod).add(s);
        }
    }
    const parts = ['/** Сгенерировано @monorepo/client-generator — не редактировать вручную */', ''];
    const imp = sharedImportLines(shared);
    if (imp.length)
        parts.push(...imp, '');
    for (const en of enums)
        parts.push(enumSrc(en), '');
    for (const decl of sorted)
        parts.push(buildInterfaceSrc(decl, registry, cfg), '');
    return parts.join('\n');
}
// ---------------------------------------------------------------------------
// Запись моделей (split)
// ---------------------------------------------------------------------------
function buildSplitFileSrc(decl, registry, cfg, enumNames) {
    const iface = registry.modelName.get(decl.getName());
    const shared = sharedImportsForStruct(decl, cfg);
    const sibling = new Set();
    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t)
            continue;
        for (const r of (0, ast_helpers_1.collectTypeRefNames)(t)) {
            if (cfg.builtinTypeNames.has(r))
                continue;
            if (registry.has(r)) {
                const exp = registry.modelName.get(r);
                if (exp !== iface)
                    sibling.add(exp);
            }
            else if (enumNames.has(r)) {
                sibling.add(r);
            }
        }
    }
    const lines = ['/** @generated */', ''];
    lines.push(...sharedImportLines(shared));
    for (const x of [...sibling].sort())
        lines.push(`import type { ${x} } from './${x}';`);
    if (lines[lines.length - 1] !== '')
        lines.push('');
    lines.push(buildInterfaceSrc(decl, registry, cfg), '');
    return lines.join('\n');
}
// ---------------------------------------------------------------------------
// Запись файлов
// ---------------------------------------------------------------------------
async function writeModels(sorted, enums, registry, cfg, modelsDir) {
    await promises_1.default.mkdir(modelsDir, { recursive: true });
    // Очистить старые .ts
    for (const f of await promises_1.default.readdir(modelsDir).catch(() => [])) {
        if (f.endsWith('.ts'))
            await promises_1.default.unlink(path_1.default.join(modelsDir, f)).catch(() => undefined);
    }
    if (cfg.modelsLayout === 'bundle') {
        await promises_1.default.writeFile(path_1.default.join(modelsDir, 'index.ts'), buildBundleContent(sorted, enums, registry, cfg), 'utf-8');
        return;
    }
    // split
    const enumNames = new Set(enums.map((e) => e.getName()).filter(Boolean));
    for (const en of enums) {
        await promises_1.default.writeFile(path_1.default.join(modelsDir, `${en.getName()}.ts`), `/** @generated */\n\n${enumSrc(en)}\n`, 'utf-8');
    }
    for (const decl of sorted) {
        const iface = registry.modelName.get(decl.getName());
        if (!iface)
            continue;
        await promises_1.default.writeFile(path_1.default.join(modelsDir, `${iface}.ts`), buildSplitFileSrc(decl, registry, cfg, enumNames), 'utf-8');
    }
    const allExports = [
        ...enumNames,
        ...sorted.map((d) => registry.modelName.get(d.getName())).filter((x) => Boolean(x)),
    ];
    const barrel = ['/** @generated */', '', ...[...new Set(allExports)].sort().map((e) => `export * from './${e}';`), ''].join('\n');
    await promises_1.default.writeFile(path_1.default.join(modelsDir, 'index.ts'), barrel, 'utf-8');
}
