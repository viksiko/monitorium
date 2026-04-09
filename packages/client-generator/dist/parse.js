"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerBasename = controllerBasename;
exports.toObjectName = toObjectName;
exports.parseControllerMeta = parseControllerMeta;
exports.parseHttpDec = parseHttpDec;
exports.paramKind = paramKind;
exports.parseMethod = parseMethod;
exports.parseControllerEndpoints = parseControllerEndpoints;
const ts_morph_1 = require("ts-morph");
const HTTP_DECORATORS = new Set(['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head']);
function controllerBasename(className) {
    return className.endsWith('Controller') ? className.slice(0, -'Controller'.length) : className;
}
function toObjectName(className) {
    const base = controllerBasename(className);
    return base.charAt(0).toLowerCase() + base.slice(1);
}
function parseControllerMeta(dec) {
    const args = dec.getArguments();
    if (args.length === 0)
        return { path: '', version: '1' };
    const first = args[0];
    if (ts_morph_1.Node.isStringLiteral(first))
        return { path: first.getLiteralValue(), version: '1' };
    if (ts_morph_1.Node.isObjectLiteralExpression(first)) {
        let routePath = '';
        let version = '1';
        for (const p of first.getProperties()) {
            if (!ts_morph_1.Node.isPropertyAssignment(p))
                continue;
            const init = p.getInitializer();
            if (!init)
                continue;
            if (p.getName() === 'path' && ts_morph_1.Node.isStringLiteral(init))
                routePath = init.getLiteralValue();
            if (p.getName() === 'version') {
                if (ts_morph_1.Node.isStringLiteral(init))
                    version = init.getLiteralValue();
                if (ts_morph_1.Node.isNumericLiteral(init))
                    version = init.getLiteralValue().toString();
            }
        }
        return { path: routePath, version };
    }
    return { path: '', version: '1' };
}
function parseHttpDec(dec) {
    const name = dec.getName();
    if (!HTTP_DECORATORS.has(name))
        return undefined;
    const arg = dec.getArguments()[0];
    return { method: name.toUpperCase(), route: arg && ts_morph_1.Node.isStringLiteral(arg) ? arg.getLiteralValue() : '' };
}
function paramKind(p) {
    for (const d of p.getDecorators()) {
        const n = d.getName();
        if (n === 'Body' || n === 'Query' || n === 'Param' || n === 'Req' || n === 'Res')
            return n;
    }
    return 'other';
}
/** Разобрать публичный HTTP-метод контроллера. Возвращает undefined если метод не HTTP-хендлер. */
function parseMethod(sf, ctrlMeta, classDecl, methodName) {
    const method = classDecl.getMethod(methodName);
    if (!method)
        return undefined;
    if (method.hasModifier(ts_morph_1.SyntaxKind.PrivateKeyword) || method.hasModifier(ts_morph_1.SyntaxKind.ProtectedKeyword))
        return undefined;
    const httpDec = method.getDecorators().map(parseHttpDec).find(Boolean);
    if (!httpDec)
        return undefined;
    const pathParams = [];
    const clientArgs = [];
    for (const p of method.getParameters()) {
        const kind = paramKind(p);
        if (kind === 'Req' || kind === 'Res' || kind === 'other')
            continue;
        const rawType = p.getTypeNode()?.getText() ?? 'unknown';
        const dec = p.getDecorators().find((d) => ['Body', 'Query', 'Param'].includes(d.getName()));
        if (kind === 'Param') {
            const arg = dec.getArguments()[0];
            pathParams.push({ routeToken: arg && ts_morph_1.Node.isStringLiteral(arg) ? arg.getLiteralValue() : p.getName(), argName: p.getName() });
            continue;
        }
        if (kind === 'Body') {
            clientArgs.push({ httpPart: 'body', name: p.getName(), type: rawType });
            continue;
        }
        // @Query
        const arg0 = dec.getArguments()[0];
        if (arg0 && ts_morph_1.Node.isStringLiteral(arg0)) {
            const field = { queryName: arg0.getLiteralValue(), argName: p.getName(), optional: p.hasQuestionToken() };
            const existing = clientArgs.find((c) => c.httpPart === 'params' && c.query?.mode === 'fields');
            if (existing?.query?.mode === 'fields') {
                existing.query.fields.push(field);
            }
            else {
                clientArgs.push({ httpPart: 'params', name: `_q_${p.getName()}`, type: rawType, query: { mode: 'fields', fields: [field] } });
            }
        }
        else {
            clientArgs.push({ httpPart: 'params', name: p.getName(), type: rawType, query: { mode: 'object' } });
        }
    }
    mergeMultipleQueryFields(clientArgs);
    return {
        methodName,
        httpMethod: httpDec.method,
        methodPath: httpDec.route,
        pathParams,
        clientArgs,
        returnType: method.getReturnTypeNode()?.getText() ?? 'unknown',
    };
}
/** Несколько `@Query('field')` у разных параметров → один параметр `query: {...}` */
function mergeMultipleQueryFields(args) {
    const fields = args.filter((a) => a.httpPart === 'params' && a.query?.mode === 'fields');
    if (fields.length <= 1)
        return;
    const allFields = fields.flatMap((e) => (e.query?.mode === 'fields' ? e.query.fields : []));
    for (const e of fields)
        args.splice(args.indexOf(e), 1);
    args.push({ httpPart: 'params', name: 'query', type: 'Record<string, unknown>', query: { mode: 'fields', fields: allFields } });
}
/** Все HTTP-эндпоинты класса контроллера */
function parseControllerEndpoints(sf, classDecl, ctrlMeta) {
    const endpoints = [];
    for (const method of classDecl.getMethods()) {
        const ep = parseMethod(sf, ctrlMeta, classDecl, method.getName());
        if (ep)
            endpoints.push(ep);
    }
    return endpoints;
}
