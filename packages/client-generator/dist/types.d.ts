import type { ClassDeclaration, InterfaceDeclaration } from 'ts-morph';
export interface ControllerMeta {
    path: string;
    version: string;
}
export interface PathParam {
    routeToken: string;
    argName: string;
}
export type QuerySpec = {
    mode: 'object';
} | {
    mode: 'fields';
    fields: {
        queryName: string;
        argName: string;
        optional: boolean;
    }[];
};
export interface ClientArg {
    httpPart: 'body' | 'params';
    name: string;
    /** Сырой текст типа из AST бэкенда */
    type: string;
    query?: QuerySpec;
}
export interface ParsedEndpoint {
    methodName: string;
    httpMethod: string;
    methodPath: string;
    pathParams: PathParam[];
    clientArgs: ClientArg[];
    /** Сырой текст возвращаемого типа, например `Promise<Post | null>` */
    returnType: string;
}
export type StructDecl = ClassDeclaration | InterfaceDeclaration;
