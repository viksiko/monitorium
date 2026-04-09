import type { ClassDeclaration, MethodDeclaration } from 'ts-morph';
import type { GeneratorConfig } from './config';
import { collectTypeRefNames, findImportOf, isSharedPackage, unwrapPromise } from './ast-helpers';
import type { ModelRegistry } from './models';
import { paramKind } from './parse';
import type { ControllerMeta, ParsedEndpoint } from './types';
import { toObjectName } from './parse';

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

function buildUrl(cfg: GeneratorConfig, ctrl: ControllerMeta, methodPath: string, pathParams: ParsedEndpoint['pathParams']): string {
    const vSeg = `v${ctrl.version || '1'}`;
    const raw = [cfg.globalPrefix, vSeg, ctrl.path, methodPath].filter(Boolean).join('/').replace(/\/+/g, '/');
    let expr = '`/';
    let rest = raw.startsWith('/') ? raw.slice(1) : raw;
    for (const tok of [...rest.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1]!)) {
        const arg = pathParams.find((p) => p.routeToken === tok)?.argName ?? tok;
        const idx = rest.indexOf(`:${tok}`);
        if (idx === -1) continue;
        expr += rest.slice(0, idx) + '${encodeURIComponent(String(' + arg + '))}';
        rest = rest.slice(idx + 1 + tok.length);
    }
    return expr + rest + '`';
}

// ---------------------------------------------------------------------------
// Параметры mutator-вызова
// ---------------------------------------------------------------------------

function buildMutatorArgs(ep: ParsedEndpoint, urlExpr: string): string {
    const parts: string[] = [`url: ${urlExpr}`, `method: '${ep.httpMethod}'`];

    const body = ep.clientArgs.find((a) => a.httpPart === 'body');
    if (body) parts.push(`data: ${body.name}`);

    const queries = ep.clientArgs.filter((a) => a.httpPart === 'params');
    if (queries.length === 1) {
        const q = queries[0]!;
        if (q.query?.mode === 'object') {
            parts.push(`params: ${q.name}`);
        } else if (q.query?.mode === 'fields') {
            const fieldParts = q.query.fields.map((f) =>
                f.optional
                    ? `...((${f.argName} != null) ? { ${JSON.stringify(f.queryName)}: ${f.argName} } : {})`
                    : `${JSON.stringify(f.queryName)}: ${f.argName}`,
            );
            parts.push(`params: { ${fieldParts.join(', ')} }`);
        }
    } else if (queries.length > 1) {
        parts.push(`params: undefined /* несколько query-объектов, требует ручной правки */`);
    }

    return parts.join(',\n      ');
}

// ---------------------------------------------------------------------------
// Сигнатура функции
// ---------------------------------------------------------------------------

function paramTypeOf(method: MethodDeclaration, argName: string): string {
    return method.getParameters().find((p) => p.getName() === argName)?.getTypeNode()?.getText() ?? 'string | undefined';
}

function buildFnParams(ep: ParsedEndpoint, method: MethodDeclaration, registry: ModelRegistry): string {
    const parts: string[] = ep.pathParams.map((pp) => `${pp.argName}: string`);
    for (const a of ep.clientArgs) {
        if (a.httpPart === 'body' || (a.httpPart === 'params' && a.query?.mode === 'object')) {
            parts.push(`${a.name}: ${registry.mapType(a.type)}`);
        } else if (a.httpPart === 'params' && a.query?.mode === 'fields') {
            for (const f of a.query.fields) {
                const raw = paramTypeOf(method, f.argName);
                parts.push(`${f.argName}${f.optional ? '?' : ''}: ${registry.mapType(raw)}`);
            }
        }
    }
    return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Импорты клиентского файла
// ---------------------------------------------------------------------------

function collectClientImports(
    endpoints: ParsedEndpoint[],
    classDecl: ClassDeclaration,
    registry: ModelRegistry,
    cfg: GeneratorConfig,
): { models: Set<string>; shared: Map<string, Set<string>> } {
    const models = new Set<string>();
    const shared = new Map<string, Set<string>>();

    const consumeTypeNames = (names: Set<string>, file: ReturnType<ClassDeclaration['getSourceFile']>): void => {
        for (const name of names) {
            if (cfg.builtinTypeNames.has(name)) continue;
            if (registry.has(name)) {
                models.add(registry.modelName.get(name)!);
                continue;
            }
            const imp = findImportOf(file, name);
            if (imp && isSharedPackage(imp.module, cfg.sharedTypesPackage)) {
                if (!shared.has(imp.module)) shared.set(imp.module, new Set());
                shared.get(imp.module)!.add(imp.specText);
            }
        }
    };

    for (const ep of endpoints) {
        const method = classDecl.getMethod(ep.methodName);
        if (!method) continue;
        const sf = method.getSourceFile();
        for (const p of method.getParameters()) {
            if (['Req', 'Res', 'other'].includes(paramKind(p))) continue;
            consumeTypeNames(collectTypeRefNames(p.getTypeNode()), sf);
        }
        consumeTypeNames(collectTypeRefNames(method.getReturnTypeNode()), sf);
    }

    return { models, shared };
}

// ---------------------------------------------------------------------------
// Генерация файла клиента
// ---------------------------------------------------------------------------

export function emitClientFile(
    classDecl: ClassDeclaration,
    ctrlMeta: ControllerMeta,
    endpoints: ParsedEndpoint[],
    registry: ModelRegistry,
    cfg: GeneratorConfig,
): string {
    const { models, shared } = collectClientImports(endpoints, classDecl, registry, cfg);
    const importLines: string[] = [`import { ${cfg.mutatorExportName} } from '${cfg.mutatorImportPath}';`];

    if (models.size > 0) importLines.push(`import type { ${[...models].sort().join(', ')} } from './models/index';`);
    for (const [mod, set] of [...shared.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        importLines.push(`import type { ${[...set].sort().join(', ')} } from '${mod}';`);
    }

    const methods: string[] = [];
    for (const ep of endpoints) {
        const method = classDecl.getMethod(ep.methodName)!;
        const urlExpr = buildUrl(cfg, ctrlMeta, ep.methodPath, ep.pathParams);
        const params = buildFnParams(ep, method, registry);
        const bodyType = unwrapPromise(registry.mapType(ep.returnType));
        const generic = bodyType.includes('unknown') ? '' : `<${bodyType}>`;
        methods.push(
            `  ${ep.methodName}: async (${params}) => {\n    return ${cfg.mutatorExportName}${generic}({\n      ${buildMutatorArgs(ep, urlExpr)},\n    });\n  },`,
        );
    }

    return [
        `/**`,
        ` * HTTP-клиент для ${classDecl.getName()}`,
        ` * @generated`,
        ` */`,
        '',
        ...importLines,
        '',
        `export const ${toObjectName(classDecl.getName()!)} = {`,
        ...methods,
        '} as const;',
        '',
    ].join('\n');
}
