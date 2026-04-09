"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitClientFile = emitClientFile;
const ast_helpers_1 = require("./ast-helpers");
const parse_1 = require("./parse");
const parse_2 = require("./parse");
// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------
function buildUrl(cfg, ctrl, methodPath, pathParams) {
    const vSeg = `v${ctrl.version || '1'}`;
    const raw = [cfg.globalPrefix, vSeg, ctrl.path, methodPath].filter(Boolean).join('/').replace(/\/+/g, '/');
    let expr = '`/';
    let rest = raw.startsWith('/') ? raw.slice(1) : raw;
    for (const tok of [...rest.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => m[1])) {
        const arg = pathParams.find((p) => p.routeToken === tok)?.argName ?? tok;
        const idx = rest.indexOf(`:${tok}`);
        if (idx === -1)
            continue;
        expr += rest.slice(0, idx) + '${encodeURIComponent(String(' + arg + '))}';
        rest = rest.slice(idx + 1 + tok.length);
    }
    return expr + rest + '`';
}
// ---------------------------------------------------------------------------
// Параметры mutator-вызова
// ---------------------------------------------------------------------------
function buildMutatorArgs(ep, urlExpr) {
    const parts = [`url: ${urlExpr}`, `method: '${ep.httpMethod}'`];
    const body = ep.clientArgs.find((a) => a.httpPart === 'body');
    if (body)
        parts.push(`data: ${body.name}`);
    const queries = ep.clientArgs.filter((a) => a.httpPart === 'params');
    if (queries.length === 1) {
        const q = queries[0];
        if (q.query?.mode === 'object') {
            parts.push(`params: ${q.name}`);
        }
        else if (q.query?.mode === 'fields') {
            const fieldParts = q.query.fields.map((f) => f.optional
                ? `...((${f.argName} != null) ? { ${JSON.stringify(f.queryName)}: ${f.argName} } : {})`
                : `${JSON.stringify(f.queryName)}: ${f.argName}`);
            parts.push(`params: { ${fieldParts.join(', ')} }`);
        }
    }
    else if (queries.length > 1) {
        parts.push(`params: undefined /* несколько query-объектов, требует ручной правки */`);
    }
    return parts.join(',\n      ');
}
// ---------------------------------------------------------------------------
// Сигнатура функции
// ---------------------------------------------------------------------------
function paramTypeOf(method, argName) {
    return method.getParameters().find((p) => p.getName() === argName)?.getTypeNode()?.getText() ?? 'string | undefined';
}
function buildFnParams(ep, method, registry) {
    const parts = ep.pathParams.map((pp) => `${pp.argName}: string`);
    for (const a of ep.clientArgs) {
        if (a.httpPart === 'body' || (a.httpPart === 'params' && a.query?.mode === 'object')) {
            parts.push(`${a.name}: ${registry.mapType(a.type)}`);
        }
        else if (a.httpPart === 'params' && a.query?.mode === 'fields') {
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
function collectClientImports(endpoints, classDecl, registry, cfg) {
    const models = new Set();
    const shared = new Map();
    const consumeTypeNames = (names, file) => {
        for (const name of names) {
            if (cfg.builtinTypeNames.has(name))
                continue;
            if (registry.has(name)) {
                models.add(registry.modelName.get(name));
                continue;
            }
            const imp = (0, ast_helpers_1.findImportOf)(file, name);
            if (imp && (0, ast_helpers_1.isSharedPackage)(imp.module, cfg.sharedTypesPackage)) {
                if (!shared.has(imp.module))
                    shared.set(imp.module, new Set());
                shared.get(imp.module).add(imp.specText);
            }
        }
    };
    for (const ep of endpoints) {
        const method = classDecl.getMethod(ep.methodName);
        if (!method)
            continue;
        const sf = method.getSourceFile();
        for (const p of method.getParameters()) {
            if (['Req', 'Res', 'other'].includes((0, parse_1.paramKind)(p)))
                continue;
            consumeTypeNames((0, ast_helpers_1.collectTypeRefNames)(p.getTypeNode()), sf);
        }
        consumeTypeNames((0, ast_helpers_1.collectTypeRefNames)(method.getReturnTypeNode()), sf);
    }
    return { models, shared };
}
// ---------------------------------------------------------------------------
// Генерация файла клиента
// ---------------------------------------------------------------------------
function emitClientFile(classDecl, ctrlMeta, endpoints, registry, cfg) {
    const { models, shared } = collectClientImports(endpoints, classDecl, registry, cfg);
    const importLines = [`import { ${cfg.mutatorExportName} } from '${cfg.mutatorImportPath}';`];
    if (models.size > 0)
        importLines.push(`import type { ${[...models].sort().join(', ')} } from './models/index';`);
    for (const [mod, set] of [...shared.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        importLines.push(`import type { ${[...set].sort().join(', ')} } from '${mod}';`);
    }
    const methods = [];
    for (const ep of endpoints) {
        const method = classDecl.getMethod(ep.methodName);
        const urlExpr = buildUrl(cfg, ctrlMeta, ep.methodPath, ep.pathParams);
        const params = buildFnParams(ep, method, registry);
        const bodyType = (0, ast_helpers_1.unwrapPromise)(registry.mapType(ep.returnType));
        const generic = bodyType.includes('unknown') ? '' : `<${bodyType}>`;
        methods.push(`  ${ep.methodName}: async (${params}) => {\n    return ${cfg.mutatorExportName}${generic}({\n      ${buildMutatorArgs(ep, urlExpr)},\n    });\n  },`);
    }
    return [
        `/**`,
        ` * HTTP-клиент для ${classDecl.getName()}`,
        ` * @generated`,
        ` */`,
        '',
        ...importLines,
        '',
        `export const ${(0, parse_2.toObjectName)(classDecl.getName())} = {`,
        ...methods,
        '} as const;',
        '',
    ].join('\n');
}
