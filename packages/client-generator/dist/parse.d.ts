import { type ClassDeclaration, type Decorator, type ParameterDeclaration, type SourceFile } from 'ts-morph';
import type { ControllerMeta, ParsedEndpoint } from './types';
export declare function controllerBasename(className: string): string;
export declare function toObjectName(className: string): string;
export declare function parseControllerMeta(dec: Decorator): ControllerMeta;
export declare function parseHttpDec(dec: Decorator): {
    method: string;
    route: string;
} | undefined;
type ParamKind = 'Body' | 'Query' | 'Param' | 'Req' | 'Res' | 'other';
export declare function paramKind(p: ParameterDeclaration): ParamKind;
/** Разобрать публичный HTTP-метод контроллера. Возвращает undefined если метод не HTTP-хендлер. */
export declare function parseMethod(sf: SourceFile, ctrlMeta: ControllerMeta, classDecl: ClassDeclaration, methodName: string): ParsedEndpoint | undefined;
/** Все HTTP-эндпоинты класса контроллера */
export declare function parseControllerEndpoints(sf: SourceFile, classDecl: ClassDeclaration, ctrlMeta: ControllerMeta): ParsedEndpoint[];
export {};
