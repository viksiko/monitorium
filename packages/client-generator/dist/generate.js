"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const HTTP_DECORATORS = new Set(['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head']);
/** Имя исходной структуры (class/interface) -> имя сгенерированного интерфейса */
class ModelRegistry {
    constructor(suffix) {
        this.suffix = suffix;
        this.modelName = new Map();
        this.structs = new Map();
    }
    registerStruct(decl) {
        const n = decl.getName();
        if (!n)
            return;
        if (this.modelName.has(n))
            return;
        const emitted = this.suffix === null || this.suffix === '' ? n : `${n}${this.suffix}`;
        this.modelName.set(n, emitted);
        this.structs.set(n, decl);
    }
    hasStruct(name) {
        return this.modelName.has(name);
    }
    mapTypeText(text) {
        let out = text;
        const sorted = [...this.modelName.keys()].sort((a, b) => b.length - a.length);
        for (const c of sorted) {
            const m = this.modelName.get(c);
            out = out.replace(new RegExp(`\\b${escapeRegExp(c)}\\b`, 'g'), m);
        }
        return out;
    }
}
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function toUnix(p) {
    return p.split(path_1.default.sep).join('/');
}
function isSharedTypesImport(moduleSpecifier, cfg) {
    return moduleSpecifier === cfg.sharedTypesPackage || moduleSpecifier.startsWith(`${cfg.sharedTypesPackage}/`);
}
function isBackendSourceFile(filePath, cfg) {
    const u = toUnix(path_1.default.normalize(filePath));
    return u.includes('/apps/backend/src/') || u.includes('/apps/backend/libs/');
}
function isExternalOrPrisma(filePath) {
    const u = toUnix(path_1.default.normalize(filePath));
    return u.includes('node_modules');
}
function isPrismaImportModule(moduleSpecifier) {
    return moduleSpecifier === '@prisma/client' || moduleSpecifier.startsWith('@prisma/');
}
function controllerBasename(className) {
    return className.endsWith('Controller') ? className.slice(0, -'Controller'.length) : className;
}
function toClientObjectName(className) {
    const base = controllerBasename(className);
    return base.charAt(0).toLowerCase() + base.slice(1);
}
function parseControllerDecorator(dec) {
    const args = dec.getArguments();
    if (args.length === 0)
        return { path: '', version: '1' };
    const first = args[0];
    if (ts_morph_1.Node.isStringLiteral(first)) {
        return { path: first.getLiteralValue(), version: '1' };
    }
    if (ts_morph_1.Node.isObjectLiteralExpression(first)) {
        let routePath = '';
        let version = '1';
        for (const p of first.getProperties()) {
            if (!ts_morph_1.Node.isPropertyAssignment(p))
                continue;
            const key = p.getName();
            const init = p.getInitializer();
            if (key === 'path' && init && ts_morph_1.Node.isStringLiteral(init))
                routePath = init.getLiteralValue();
            if (key === 'version' && init && ts_morph_1.Node.isStringLiteral(init))
                version = init.getLiteralValue();
            if (key === 'version' && init && ts_morph_1.Node.isNumericLiteral(init))
                version = init.getLiteralValue().toString();
        }
        return { path: routePath, version };
    }
    return { path: '', version: '1' };
}
function parseHttpDecorator(dec) {
    const name = dec.getName();
    if (!HTTP_DECORATORS.has(name))
        return undefined;
    const arg0 = dec.getArguments()[0];
    const route = arg0 && ts_morph_1.Node.isStringLiteral(arg0) ? arg0.getLiteralValue() : '';
    return { method: name.toUpperCase(), route };
}
function getParamDecoratorKind(p) {
    for (const d of p.getDecorators()) {
        const n = d.getName();
        if (n === 'Body' || n === 'Query' || n === 'Param' || n === 'Req' || n === 'Res')
            return n;
    }
    return 'other';
}
function parseMethod(method, ctrlMeta, sourceFile, cfg) {
    const httpDec = method.getDecorators().map(parseHttpDecorator).find(Boolean);
    if (!httpDec)
        return undefined;
    if (method.hasModifier(ts_morph_1.SyntaxKind.PrivateKeyword) || method.hasModifier(ts_morph_1.SyntaxKind.ProtectedKeyword))
        return undefined;
    const pathParams = [];
    const clientArgs = [];
    for (const p of method.getParameters()) {
        const kind = getParamDecoratorKind(p);
        if (kind === 'Req' || kind === 'Res')
            continue;
        if (kind === 'other')
            continue;
        const dec = p.getDecorators().find((d) => ['Body', 'Query', 'Param'].includes(d.getName()));
        const typeNode = p.getTypeNode();
        const rawType = typeNode?.getText() ?? 'unknown';
        if (kind === 'Param') {
            const paramDec = dec;
            const arg = paramDec.getArguments()[0];
            const routeName = arg && ts_morph_1.Node.isStringLiteral(arg) ? arg.getLiteralValue() : p.getName();
            pathParams.push({ routeToken: routeName, argName: p.getName() });
            continue;
        }
        if (kind === 'Body') {
            clientArgs.push({ httpPart: 'body', name: p.getName(), type: rawType });
            continue;
        }
        if (kind === 'Query') {
            const arg0 = dec.getArguments()[0];
            if (arg0 && ts_morph_1.Node.isStringLiteral(arg0)) {
                const qName = arg0.getLiteralValue();
                const optional = p.hasQuestionToken();
                const existing = clientArgs.find((c) => c.httpPart === 'params' && c.query?.mode === 'fields');
                const field = { queryName: qName, argName: p.getName(), optional };
                if (existing && existing.query?.mode === 'fields') {
                    existing.query.fields.push(field);
                }
                else {
                    clientArgs.push({
                        httpPart: 'params',
                        name: `_query_${p.getName()}`,
                        type: rawType,
                        query: { mode: 'fields', fields: [field] },
                    });
                }
            }
            else {
                clientArgs.push({
                    httpPart: 'params',
                    name: p.getName(),
                    type: rawType,
                    query: { mode: 'object' },
                });
            }
        }
    }
    /** merge multiple field-only query params into one synthetic arg object for the function signature */
    normalizeQueryFields(clientArgs);
    const retNode = method.getReturnTypeNode();
    const returnType = retNode?.getText() ?? 'unknown';
    return {
        methodName: method.getName(),
        httpMethod: httpDec.method,
        methodPath: httpDec.route,
        pathParams,
        clientArgs,
        returnType,
    };
}
/** Collapse separate params entries that are only query fields into one params argument */
function normalizeQueryFields(args) {
    const fieldEntries = args.filter((a) => a.httpPart === 'params' && a.query?.mode === 'fields');
    if (fieldEntries.length <= 1)
        return;
    const allFields = [];
    for (const e of fieldEntries) {
        if (e.query?.mode === 'fields')
            allFields.push(...e.query.fields);
    }
    for (const e of fieldEntries) {
        const i = args.indexOf(e);
        if (i >= 0)
            args.splice(i, 1);
    }
    args.push({
        httpPart: 'params',
        name: 'query',
        type: 'Record<string, unknown>',
        query: { mode: 'fields', fields: allFields },
    });
}
function mapExternalTypes(text, _cfg) {
    return text;
}
function collectTypeReferenceNames(node) {
    if (!node)
        return new Set();
    const out = new Set();
    const visit = (n) => {
        if (n.getKind() === ts_morph_1.SyntaxKind.TypeReference) {
            const tr = n;
            const tn = tr.getTypeName().getText();
            out.add(tn.replace(/\[.*$/, '').split('<')[0].trim());
        }
        n.getChildren().forEach(visit);
    };
    visit(node);
    return out;
}
function resolveEnumForIdentifier(name, fromFile) {
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
function resolveStructForIdentifier(name, fromFile) {
    const localC = fromFile.getClass(name);
    if (localC)
        return localC;
    const localI = fromFile.getInterface(name);
    if (localI)
        return localI;
    for (const decl of fromFile.getImportDeclarations()) {
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (orig !== name && alias !== name)
                continue;
            const target = decl.getModuleSpecifierSourceFile();
            if (!target)
                continue;
            const c = target.getClass(orig);
            if (c)
                return c;
            const i = target.getInterface(orig);
            if (i)
                return i;
        }
    }
    return undefined;
}
function needsModelForStruct(decl, cfg) {
    const fp = decl.getSourceFile().getFilePath();
    if (!isBackendSourceFile(fp, cfg))
        return false;
    const n = decl.getName() ?? '';
    if (ts_morph_1.Node.isClassDeclaration(decl)) {
        if (n.endsWith('Controller') || n.endsWith('Service') || n.endsWith('Module') || n.endsWith('Guard'))
            return false;
    }
    return true;
}
function collectModelsFromTypeNode(typeNode, fromFile, registry, cfg) {
    if (!typeNode)
        return;
    const names = collectTypeReferenceNames(typeNode);
    for (const n of names) {
        if (cfg.builtinTypeNames.has(n))
            continue;
        const st = resolveStructForIdentifier(n, fromFile);
        if (!st || !needsModelForStruct(st, cfg))
            continue;
        registry.registerStruct(st);
    }
}
function bfsExpandModels(registry, cfg) {
    const queue = [...registry.structs.values()];
    let i = 0;
    while (i < queue.length) {
        const decl = queue[i++];
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            const names = collectTypeReferenceNames(t);
            for (const n of names) {
                if (cfg.builtinTypeNames.has(n))
                    continue;
                const inner = decl.getSourceFile().getClass(n) ??
                    decl.getSourceFile().getInterface(n) ??
                    resolveStructForIdentifier(n, decl.getSourceFile());
                if (inner && needsModelForStruct(inner, cfg) && inner.getName() && !registry.hasStruct(inner.getName())) {
                    registry.registerStruct(inner);
                    queue.push(inner);
                }
            }
        }
    }
}
function topoSortModels(registry) {
    const names = [...registry.structs.keys()];
    const edges = new Map();
    for (const n of names)
        edges.set(n, new Set());
    for (const [n, decl] of registry.structs) {
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            for (const ref of collectTypeReferenceNames(t)) {
                if (registry.hasStruct(ref) && ref !== n)
                    edges.get(n).add(ref);
            }
        }
    }
    const result = [];
    const temp = new Set();
    const perm = new Set();
    const visit = (n) => {
        if (perm.has(n))
            return;
        if (temp.has(n))
            return;
        temp.add(n);
        for (const m of edges.get(n) ?? [])
            visit(m);
        temp.delete(n);
        perm.add(n);
        const st = registry.structs.get(n);
        if (st)
            result.push(st);
    };
    for (const n of names)
        visit(n);
    return result;
}
function collectEnumsForModels(sorted, cfg) {
    const byName = new Map();
    for (const decl of sorted) {
        for (const prop of decl.getProperties()) {
            const t = prop.getTypeNode();
            if (!t)
                continue;
            for (const r of collectTypeReferenceNames(t)) {
                const en = resolveEnumForIdentifier(r, decl.getSourceFile());
                if (!en)
                    continue;
                const fp = en.getSourceFile().getFilePath();
                if (!isBackendSourceFile(fp, cfg) || isExternalOrPrisma(fp))
                    continue;
                const n = en.getName();
                if (n && !byName.has(n))
                    byName.set(n, en);
            }
        }
    }
    return [...byName.values()];
}
function emitEnumDecl(e) {
    const text = e.getText().trim();
    return text.startsWith('export') ? `${text}\n\n` : `export ${text}\n\n`;
}
function collectSharedTypesUsedInModels(sorted, cfg) {
    const shared = new Map();
    for (const decl of sorted) {
        mergeSharedFromStruct(decl, cfg, shared);
    }
    return shared;
}
function collectSharedTypesForOneStruct(decl, cfg) {
    const shared = new Map();
    mergeSharedFromStruct(decl, cfg, shared);
    return shared;
}
function mergeSharedFromStruct(decl, cfg, into) {
    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t)
            continue;
        for (const name of collectTypeReferenceNames(t)) {
            if (cfg.builtinTypeNames.has(name))
                continue;
            const imp = findImportedName(decl.getSourceFile(), name);
            if (imp && isSharedTypesImport(imp.module, cfg)) {
                if (!into.has(imp.module))
                    into.set(imp.module, new Set());
                into.get(imp.module).add(imp.importSpecifierText);
            }
        }
    }
}
function buildInterfaceSourceForStruct(decl, registry, cfg) {
    const iface = registry.modelName.get(decl.getName());
    if (!iface)
        return '';
    const lines = [`export interface ${iface} {`];
    for (const prop of decl.getProperties()) {
        const opt = prop.hasQuestionToken() ? '?' : '';
        const tNode = prop.getTypeNode();
        const raw = tNode?.getText() ?? 'unknown';
        let mapped = registry.mapTypeText(raw);
        const refs = collectTypeReferenceNames(tNode);
        for (const r of refs) {
            const resolved = resolveStructForIdentifier(r, decl.getSourceFile());
            if (resolved) {
                const fp = resolved.getSourceFile().getFilePath();
                if (isExternalOrPrisma(fp)) {
                    if (cfg.strictTypes) {
                        throw new Error(`[client-generator] Тип "${r}" из ${fp} не поддерживается (strictTypes). Метод/свойство: ${decl.getName()}.${prop.getName()}`);
                    }
                    mapped = mapped.replace(new RegExp(`\\b${escapeRegExp(r)}\\b`, 'g'), 'unknown');
                }
            }
            else {
                const imp = findImportedName(decl.getSourceFile(), r);
                if (imp && isPrismaImportModule(imp.module)) {
                    if (cfg.strictTypes) {
                        throw new Error(`[client-generator] Импорт Prisma "${r}" из ${imp.module} (strictTypes). Модель: ${decl.getName()}.${prop.getName()}`);
                    }
                    mapped = mapped.replace(new RegExp(`\\b${escapeRegExp(r)}\\b`, 'g'), 'unknown');
                }
            }
        }
        lines.push(`  ${prop.getName()}${opt}: ${mapped};`);
    }
    lines.push('}', '');
    return lines.join('\n');
}
function emitModelInterfacesBundle(sorted, registry, cfg) {
    const importLines = [];
    const sharedUsed = collectSharedTypesUsedInModels(sorted, cfg);
    for (const [mod, set] of [...sharedUsed.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        importLines.push(`import type { ${[...set].sort().join(', ')} } from '${mod}';`);
    }
    const lines = [
        '/** Сгенерировано @monorepo/client-generator — не править вручную */',
        '',
        ...importLines,
        ...(importLines.length ? [''] : []),
    ];
    for (const en of collectEnumsForModels(sorted, cfg)) {
        lines.push(emitEnumDecl(en));
    }
    for (const decl of sorted) {
        lines.push(buildInterfaceSourceForStruct(decl, registry, cfg));
        lines.push('');
    }
    return lines.join('\n');
}
function emitOneSplitModelFile(decl, registry, cfg, allEnums) {
    const iface = registry.modelName.get(decl.getName());
    const sharedMap = collectSharedTypesForOneStruct(decl, cfg);
    const importLines = [];
    for (const [mod, set] of [...sharedMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        importLines.push(`import type { ${[...set].sort().join(', ')} } from '${mod}';`);
    }
    const enumNames = new Set(allEnums.map((e) => e.getName()).filter(Boolean));
    const siblingImports = new Set();
    for (const prop of decl.getProperties()) {
        const t = prop.getTypeNode();
        if (!t)
            continue;
        for (const r of collectTypeReferenceNames(t)) {
            if (cfg.builtinTypeNames.has(r))
                continue;
            if (registry.hasStruct(r)) {
                const exp = registry.modelName.get(r);
                if (exp !== iface)
                    siblingImports.add(exp);
            }
            else if (enumNames.has(r)) {
                siblingImports.add(r);
            }
        }
    }
    for (const x of [...siblingImports].sort((a, b) => a.localeCompare(b))) {
        importLines.push(`import type { ${x} } from './${x}';`);
    }
    const headerParts = ['/** @generated */', ''];
    if (importLines.length > 0) {
        headerParts.push(...importLines, '');
    }
    const header = headerParts.join('\n');
    const body = buildInterfaceSourceForStruct(decl, registry, cfg);
    return `${header}${body}\n`;
}
async function clearModelsDir(modelsDir) {
    let entries = [];
    try {
        entries = await promises_1.default.readdir(modelsDir);
    }
    catch {
        return;
    }
    await Promise.all(entries
        .filter((f) => f.endsWith('.ts'))
        .map((f) => promises_1.default.unlink(path_1.default.join(modelsDir, f)).catch(() => undefined)));
}
function extractRouteParamNames(route) {
    const m = [...route.matchAll(/:([A-Za-z0-9_]+)/g)];
    return m.map((x) => x[1]);
}
function buildUrlExpression(cfg, ctrl, methodPath, pathParams) {
    const versionSeg = ctrl.version ? `v${ctrl.version}` : 'v1';
    const segs = [cfg.globalPrefix, versionSeg, ctrl.path, methodPath]
        .filter((s) => s.length > 0)
        .join('/')
        .replace(/\/+/g, '/');
    let expr = '`/';
    let rest = segs.startsWith('/') ? segs.slice(1) : segs;
    const tokens = extractRouteParamNames(rest);
    for (const tok of tokens) {
        const p = pathParams.find((x) => x.routeToken === tok);
        const arg = p?.argName ?? tok;
        const idx = rest.indexOf(`:${tok}`);
        if (idx === -1)
            continue;
        expr += rest.slice(0, idx);
        expr += '${encodeURIComponent(String(' + arg + '))}';
        rest = rest.slice(idx + 1 + tok.length);
    }
    expr += rest;
    expr += '`';
    return expr;
}
function buildMutatorArgObject(ep, urlExpr) {
    const lines = [`url: ${urlExpr}`, `method: '${ep.httpMethod}'`];
    const bodyArg = ep.clientArgs.find((a) => a.httpPart === 'body');
    const queryArg = ep.clientArgs.filter((a) => a.httpPart === 'params');
    if (bodyArg)
        lines.push(`data: ${bodyArg.name}`);
    if (queryArg.length === 1 && queryArg[0].query?.mode === 'object') {
        lines.push(`params: ${queryArg[0].name}`);
    }
    else if (queryArg.length === 1 && queryArg[0].query?.mode === 'fields') {
        const fields = queryArg[0].query.fields;
        const parts = fields.map((f) => {
            if (f.optional) {
                return `...((${f.argName} !== undefined && ${f.argName} !== null) ? { ${JSON.stringify(f.queryName)}: ${f.argName} } : {})`;
            }
            return `${JSON.stringify(f.queryName)}: ${f.argName}`;
        });
        lines.push(`params: { ${parts.join(', ')} }`);
    }
    else if (queryArg.length > 0) {
        lines.push(`params: undefined /* unsupported query merge */`);
    }
    return lines.join(',\n      ');
}
function mapArgType(raw, registry, cfg) {
    return registry.mapTypeText(mapExternalTypes(raw, cfg));
}
function buildFunctionParams(ep, method, registry, cfg) {
    const parts = [];
    for (const pp of ep.pathParams) {
        parts.push(`${pp.argName}: string`);
    }
    for (const a of ep.clientArgs) {
        if (a.httpPart === 'body') {
            parts.push(`${a.name}: ${mapArgType(a.type, registry, cfg)}`);
        }
        else if (a.httpPart === 'params' && a.query?.mode === 'object') {
            parts.push(`${a.name}: ${mapArgType(a.type, registry, cfg)}`);
        }
        else if (a.httpPart === 'params' && a.query?.mode === 'fields') {
            for (const f of a.query.fields) {
                const opt = f.optional ? '?' : '';
                parts.push(`${f.argName}${opt}: ${mapArgType(typeDisplayFromParameter(method, f.argName), registry, cfg)}`);
            }
        }
    }
    return parts.join(', ');
}
function typeDisplayFromParameter(method, argName) {
    const p = method.getParameters().find((x) => x.getName() === argName);
    return p?.getTypeNode()?.getText() ?? 'string | undefined';
}
/** Для generic mutator: тело ответа без внешнего Promise */
function unwrapPromiseType(typeStr) {
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
            depth--;
            if (depth === 0) {
                return s.slice(lt + 1, i).trim();
            }
        }
    }
    return s;
}
function collectImportsForEndpoint(ep, method, registry, cfg) {
    const shared = new Map();
    const models = new Set();
    const consumeNode = (n) => {
        if (!n)
            return;
        const refs = collectTypeReferenceNames(n);
        for (const name of refs) {
            if (cfg.builtinTypeNames.has(name))
                continue;
            if (registry.hasStruct(name)) {
                models.add(registry.modelName.get(name));
                continue;
            }
            const imp = findImportedName(method.getSourceFile(), name);
            if (imp && isSharedTypesImport(imp.module, cfg)) {
                if (!shared.has(imp.module))
                    shared.set(imp.module, new Set());
                /** use original export text if aliased */
                shared.get(imp.module).add(imp.importSpecifierText);
            }
        }
    };
    for (const p of method.getParameters()) {
        const kind = getParamDecoratorKind(p);
        if (kind === 'Req' || kind === 'Res' || kind === 'other')
            continue;
        consumeNode(p.getTypeNode());
    }
    consumeNode(method.getReturnTypeNode());
    return { shared, models };
}
function findImportedName(file, name) {
    for (const decl of file.getImportDeclarations()) {
        const mod = decl.getModuleSpecifierValue();
        for (const spec of decl.getNamedImports()) {
            const orig = spec.getName();
            const alias = spec.getAliasNode()?.getText();
            if (alias === name)
                return { module: mod, importSpecifierText: spec.getText() };
            if (orig === name && !alias)
                return { module: mod, importSpecifierText: orig };
        }
    }
    return undefined;
}
function emitControllerClient(classDecl, ctrlMeta, endpoints, registry, cfg) {
    const objectName = toClientObjectName(classDecl.getName());
    const importLines = [];
    importLines.push(`import { ${cfg.mutatorExportName} } from '${cfg.mutatorImportPath}';`);
    const allShared = new Map();
    const allModels = new Set();
    for (const ep of endpoints) {
        const m = classDecl.getMethodOrThrow(ep.methodName);
        const { shared, models } = collectImportsForEndpoint(ep, m, registry, cfg);
        for (const [mod, set] of shared) {
            if (!allShared.has(mod))
                allShared.set(mod, new Set());
            for (const x of set)
                allShared.get(mod).add(x);
        }
        for (const mo of models)
            allModels.add(mo);
    }
    if (allModels.size > 0) {
        const sortedM = [...allModels].sort();
        importLines.push(`import type { ${sortedM.join(', ')} } from './models/index';`);
    }
    for (const [mod, set] of [...allShared.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        importLines.push(`import type { ${[...set].sort().join(', ')} } from '${mod}';`);
    }
    const methodParts = [];
    for (const ep of endpoints) {
        const method = classDecl.getMethodOrThrow(ep.methodName);
        const urlExpr = buildUrlExpression(cfg, ctrlMeta, ep.methodPath, ep.pathParams);
        const mutatorInner = buildMutatorArgObject(ep, urlExpr);
        const params = buildFunctionParams(ep, method, registry, cfg);
        const bodyType = unwrapPromiseType(registry.mapTypeText(mapExternalTypes(ep.returnType, cfg)));
        const generic = bodyType.includes('unknown') ? '' : `<${bodyType}>`;
        methodParts.push(`  ${ep.methodName}: async (${params}) => {\n    return ${cfg.mutatorExportName}${generic}({\n      ${mutatorInner},\n    });\n  },`);
    }
    const body = [
        '/**',
        ` * HTTP-клиент для ${classDecl.getName()}`,
        ' * @generated',
        ' */',
        '',
        ...importLines,
        '',
        `export const ${objectName} = {`,
        ...methodParts,
        '} as const;',
        '',
    ].join('\n');
    return body;
}
async function generate(cfg) {
    const tsConfigPath = path_1.default.join(cfg.repoRoot, cfg.backendTsconfig);
    const project = new ts_morph_1.Project({ tsConfigFilePath: tsConfigPath });
    const controllers = project
        .getSourceFiles()
        .filter((sf) => sf.getFilePath().endsWith('.controller.ts') && isBackendSourceFile(sf.getFilePath(), cfg));
    const registry = new ModelRegistry(cfg.modelSuffix);
    const planned = [];
    for (const sf of controllers) {
        for (const cd of sf.getClasses()) {
            const dec = cd.getDecorator('Controller');
            if (!dec)
                continue;
            const ctrlMeta = parseControllerDecorator(dec);
            const endpoints = [];
            for (const method of cd.getMethods()) {
                const ep = parseMethod(method, ctrlMeta, sf, cfg);
                if (!ep)
                    continue;
                endpoints.push(ep);
                collectModelsFromTypeNode(method.getReturnTypeNode(), sf, registry, cfg);
                for (const p of method.getParameters()) {
                    if (['Req', 'Res', 'other'].includes(getParamDecoratorKind(p)))
                        continue;
                    collectModelsFromTypeNode(p.getTypeNode(), sf, registry, cfg);
                }
            }
            if (endpoints.length === 0)
                continue;
            planned.push({ file: sf, classDecl: cd, ctrlMeta, endpoints });
        }
    }
    /** Second pass: re-register from all collected endpoints after full BFS */
    for (const pl of planned) {
        for (const ep of pl.endpoints) {
            const m = pl.classDecl.getMethodOrThrow(ep.methodName);
            collectModelsFromTypeNode(m.getReturnTypeNode(), pl.file, registry, cfg);
            for (const p of m.getParameters()) {
                collectModelsFromTypeNode(p.getTypeNode(), pl.file, registry, cfg);
            }
        }
    }
    bfsExpandModels(registry, cfg);
    const sortedClasses = topoSortModels(registry);
    const modelsDir = path_1.default.join(cfg.repoRoot, cfg.outputDir, 'models');
    const outDir = path_1.default.join(cfg.repoRoot, cfg.outputDir);
    await promises_1.default.mkdir(modelsDir, { recursive: true });
    await clearModelsDir(modelsDir);
    const enumsList = collectEnumsForModels(sortedClasses, cfg);
    if (cfg.modelsLayout === 'bundle') {
        const modelsContent = emitModelInterfacesBundle(sortedClasses, registry, cfg);
        await promises_1.default.writeFile(path_1.default.join(modelsDir, 'index.ts'), modelsContent, 'utf-8');
    }
    else {
        for (const en of enumsList) {
            const n = en.getName();
            const body = [`/** @generated */`, '', emitEnumDecl(en).trim(), ''].join('\n');
            await promises_1.default.writeFile(path_1.default.join(modelsDir, `${n}.ts`), body, 'utf-8');
        }
        for (const decl of sortedClasses) {
            const iface = registry.modelName.get(decl.getName());
            if (!iface)
                continue;
            const body = emitOneSplitModelFile(decl, registry, cfg, enumsList);
            await promises_1.default.writeFile(path_1.default.join(modelsDir, `${iface}.ts`), body, 'utf-8');
        }
        const enumNames = enumsList.map((e) => e.getName()).filter(Boolean);
        const modelNames = sortedClasses
            .map((d) => registry.modelName.get(d.getName()))
            .filter((x) => Boolean(x));
        const exportNames = [...new Set([...enumNames, ...modelNames])].sort((a, b) => a.localeCompare(b));
        const indexBody = [
            '/** @generated — re-export моделей */',
            '',
            ...exportNames.map((e) => `export * from './${e}';`),
            '',
        ].join('\n');
        await promises_1.default.writeFile(path_1.default.join(modelsDir, 'index.ts'), indexBody, 'utf-8');
    }
    const controllerFiles = [];
    const barrelExports = [];
    for (const pl of planned) {
        const base = controllerBasename(pl.classDecl.getName());
        const fileBase = `${base.charAt(0).toLowerCase() + base.slice(1)}.client.ts`;
        const filePath = path_1.default.join(outDir, fileBase);
        const src = emitControllerClient(pl.classDecl, pl.ctrlMeta, pl.endpoints, registry, cfg);
        await promises_1.default.writeFile(filePath, src, 'utf-8');
        controllerFiles.push(filePath);
        barrelExports.push(`export { ${toClientObjectName(pl.classDecl.getName())} } from './${fileBase.replace(/\.ts$/, '')}';`);
    }
    const barrel = [
        '/** @generated */',
        '',
        ...barrelExports.sort(),
        '',
    ].join('\n') + '\n';
    await promises_1.default.writeFile(path_1.default.join(outDir, 'index.ts'), barrel, 'utf-8');
    return { controllerFiles, modelsIndex: path_1.default.join(modelsDir, 'index.ts') };
}
