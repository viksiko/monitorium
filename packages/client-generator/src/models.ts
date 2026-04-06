import fs from 'fs/promises';
import path from 'path';
import { Node, type EnumDeclaration, type SourceFile } from 'ts-morph';
import type { GeneratorConfig } from './config';
import {
    collectTypeRefNames,
    escapeRegExp,
    findImportOf,
    isBackendFile,
    isInNodeModules,
    isPrismaModule,
    isSharedPackage,
    resolveEnum,
    resolveStruct,
} from './ast-helpers';
import type { StructDecl } from './types';

// ---------------------------------------------------------------------------
// ModelRegistry
// ---------------------------------------------------------------------------

/** Реестр: исходное имя (class/interface) → имя сгенерированного интерфейса */
export class ModelRegistry {
    readonly modelName = new Map<string, string>();
    readonly structs = new Map<string, StructDecl>();

    constructor(private readonly suffix: string | null) {}

    register(decl: StructDecl): void {
        const n = decl.getName();
        if (!n || this.modelName.has(n)) return;
        const emitted = this.suffix ? `${n}${this.suffix}` : n;
        this.modelName.set(n, emitted);
        this.structs.set(n, decl);
    }

    has(name: string): boolean {
        return this.modelName.has(name);
    }

    /** Подставить все зарегистрированные имена в строку типа */
    mapType(text: string): string {
        let out = text;
        for (const [orig, mapped] of [...this.modelName.entries()].sort((a, b) => b[0].length - a[0].length)) {
            out = out.replace(new RegExp(`\\b${escapeRegExp(orig)}\\b`, 'g'), mapped);
        }
        return out;
    }
}

// ---------------------------------------------------------------------------
// Сбор моделей из типов
// ---------------------------------------------------------------------------

function needsModel(decl: StructDecl, cfg: GeneratorConfig): boolean {
    const fp = decl.getSourceFile().getFilePath();
    if (!isBackendFile(fp)) return false;
    const n = decl.getName() ?? '';
    if (Node.isClassDeclaration(decl) && /Controller|Service|Module|Guard/.test(n)) return false;
    return true;
}

export function collectModelsFromNode(typeNode: import('ts-morph').Node | undefined, fromFile: SourceFile, registry: ModelRegistry, cfg: GeneratorConfig): void {
    if (!typeNode) return;
    for (const n of collectTypeRefNames(typeNode)) {
        if (cfg.builtinTypeNames.has(n)) continue;
        const st = resolveStruct(n, fromFile);
        if (st && needsModel(st, cfg)) registry.register(st);
    }
}

/** BFS: транзитивно добавить все вложенные типы зарегистрированных моделей */
export function expandModels(registry: ModelRegistry, cfg: GeneratorConfig): void {
    const queue = [...registry.structs.values()];
    for (let i = 0; i < queue.length; i++) {
        const decl = queue[i]!;
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t) continue;
            for (const n of collectTypeRefNames(t)) {
                if (cfg.builtinTypeNames.has(n) || registry.has(n)) continue;
                const inner = resolveStruct(n, decl.getSourceFile());
                if (inner && needsModel(inner, cfg)) {
                    registry.register(inner);
                    queue.push(inner);
                }
            }
        }
    }
}

/** Топологическая сортировка (зависимости — раньше) */
export function topoSort(registry: ModelRegistry): StructDecl[] {
    const edges = new Map<string, Set<string>>();
    for (const [n, decl] of registry.structs) {
        edges.set(n, new Set());
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t) continue;
            for (const ref of collectTypeRefNames(t)) {
                if (registry.has(ref) && ref !== n) edges.get(n)!.add(ref);
            }
        }
    }
    const result: StructDecl[] = [];
    const perm = new Set<string>();
    const temp = new Set<string>();
    const visit = (n: string): void => {
        if (perm.has(n) || temp.has(n)) return;
        temp.add(n);
        for (const dep of edges.get(n) ?? []) visit(dep);
        temp.delete(n);
        perm.add(n);
        const st = registry.structs.get(n);
        if (st) result.push(st);
    };
    for (const n of registry.structs.keys()) visit(n);
    return result;
}

// ---------------------------------------------------------------------------
// Enum сбор
// ---------------------------------------------------------------------------

export function collectEnums(sorted: StructDecl[], cfg: GeneratorConfig): EnumDeclaration[] {
    const byName = new Map<string, EnumDeclaration>();
    for (const decl of sorted) {
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t) continue;
            for (const r of collectTypeRefNames(t)) {
                const en = resolveEnum(r, decl.getSourceFile());
                if (!en) continue;
                const fp = en.getSourceFile().getFilePath();
                if (!isBackendFile(fp) || isInNodeModules(fp)) continue;
                const n = en.getName();
                if (n && !byName.has(n)) byName.set(n, en);
            }
        }
    }
    return [...byName.values()];
}

// ---------------------------------------------------------------------------
// Генерация исходника одного интерфейса
// ---------------------------------------------------------------------------

function buildInterfaceSrc(decl: StructDecl, registry: ModelRegistry, cfg: GeneratorConfig): string {
    const iface = registry.modelName.get(decl.getName()!);
    if (!iface) return '';
    const lines: string[] = [`export interface ${iface} {`];
    for (const prop of decl.getProperties()) {
        const opt = prop.hasQuestionToken() ? '?' : '';
        let mapped = registry.mapType(prop.getTypeNode()?.getText() ?? 'unknown');
        for (const r of collectTypeRefNames(prop.getTypeNode())) {
            const resolved = resolveStruct(r, decl.getSourceFile());
            const externalFile = resolved?.getSourceFile().getFilePath();
            const prismaByImport = !resolved && isPrismaModule(findImportOf(decl.getSourceFile(), r)?.module ?? '');
            if ((externalFile && isInNodeModules(externalFile)) || prismaByImport) {
                if (cfg.strictTypes) throw new Error(`[client-generator] Внешний тип "${r}" в ${decl.getName()}.${prop.getName()} (strictTypes=true)`);
                mapped = mapped.replace(new RegExp(`\\b${escapeRegExp(r)}\\b`, 'g'), 'unknown');
            }
        }
        lines.push(`  ${prop.getName()}${opt}: ${mapped};`);
    }
    lines.push('}');
    return lines.join('\n');
}

function enumSrc(e: EnumDeclaration): string {
    const text = e.getText().trim();
    return text.startsWith('export') ? text : `export ${text}`;
}

/** Собрать `import type` из shared-пакета для полей структуры */
function sharedImportsForStruct(decl: StructDecl, cfg: GeneratorConfig): Map<string, Set<string>> {
    const out = new Map<string, Set<string>>();
    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t) continue;
        for (const name of collectTypeRefNames(t)) {
            if (cfg.builtinTypeNames.has(name)) continue;
            const imp = findImportOf(decl.getSourceFile(), name);
            if (imp && isSharedPackage(imp.module, cfg.sharedTypesPackage)) {
                if (!out.has(imp.module)) out.set(imp.module, new Set());
                out.get(imp.module)!.add(imp.specText);
            }
        }
    }
    return out;
}

function sharedImportLines(shared: Map<string, Set<string>>): string[] {
    return [...shared.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mod, set]) => `import type { ${[...set].sort().join(', ')} } from '${mod}';`);
}

// ---------------------------------------------------------------------------
// Запись моделей (bundle)
// ---------------------------------------------------------------------------

export function buildBundleContent(sorted: StructDecl[], enums: EnumDeclaration[], registry: ModelRegistry, cfg: GeneratorConfig): string {
    const shared = new Map<string, Set<string>>();
    for (const decl of sorted) {
        for (const [mod, set] of sharedImportsForStruct(decl, cfg)) {
            if (!shared.has(mod)) shared.set(mod, new Set());
            for (const s of set) shared.get(mod)!.add(s);
        }
    }
    const parts: string[] = ['/** Сгенерировано @monorepo/client-generator — не редактировать вручную */', ''];
    const imp = sharedImportLines(shared);
    if (imp.length) parts.push(...imp, '');
    for (const en of enums) parts.push(enumSrc(en), '');
    for (const decl of sorted) parts.push(buildInterfaceSrc(decl, registry, cfg), '');
    return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Запись моделей (split)
// ---------------------------------------------------------------------------

function buildSplitFileSrc(decl: StructDecl, registry: ModelRegistry, cfg: GeneratorConfig, enumNames: Set<string>): string {
    const iface = registry.modelName.get(decl.getName()!)!;
    const shared = sharedImportsForStruct(decl, cfg);
    const sibling = new Set<string>();

    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t) continue;
        for (const r of collectTypeRefNames(t)) {
            if (cfg.builtinTypeNames.has(r)) continue;
            if (registry.has(r)) {
                const exp = registry.modelName.get(r)!;
                if (exp !== iface) sibling.add(exp);
            } else if (enumNames.has(r)) {
                sibling.add(r);
            }
        }
    }

    const lines: string[] = ['/** @generated */', ''];
    lines.push(...sharedImportLines(shared));
    for (const x of [...sibling].sort()) lines.push(`import type { ${x} } from './${x}';`);
    if (lines[lines.length - 1] !== '') lines.push('');
    lines.push(buildInterfaceSrc(decl, registry, cfg), '');
    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Запись файлов
// ---------------------------------------------------------------------------

export async function writeModels(
    sorted: StructDecl[],
    enums: EnumDeclaration[],
    registry: ModelRegistry,
    cfg: GeneratorConfig,
    modelsDir: string,
): Promise<void> {
    await fs.mkdir(modelsDir, { recursive: true });
    // Очистить старые .ts
    for (const f of await fs.readdir(modelsDir).catch(() => [] as string[])) {
        if (f.endsWith('.ts')) await fs.unlink(path.join(modelsDir, f)).catch(() => undefined);
    }

    if (cfg.modelsLayout === 'bundle') {
        await fs.writeFile(path.join(modelsDir, 'index.ts'), buildBundleContent(sorted, enums, registry, cfg), 'utf-8');
        return;
    }

    // split
    const enumNames = new Set(enums.map((e) => e.getName()!).filter(Boolean));
    for (const en of enums) {
        await fs.writeFile(path.join(modelsDir, `${en.getName()!}.ts`), `/** @generated */\n\n${enumSrc(en)}\n`, 'utf-8');
    }
    for (const decl of sorted) {
        const iface = registry.modelName.get(decl.getName()!);
        if (!iface) continue;
        await fs.writeFile(path.join(modelsDir, `${iface}.ts`), buildSplitFileSrc(decl, registry, cfg, enumNames), 'utf-8');
    }

    const allExports = [
        ...enumNames,
        ...sorted.map((d) => registry.modelName.get(d.getName()!)).filter((x): x is string => Boolean(x)),
    ];
    const barrel = ['/** @generated */', '', ...[...new Set(allExports)].sort().map((e) => `export * from './${e}';`), ''].join('\n');
    await fs.writeFile(path.join(modelsDir, 'index.ts'), barrel, 'utf-8');
}
