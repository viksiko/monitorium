import type { ClassDeclaration } from 'ts-morph';
import type { GeneratorConfig } from './config';
import type { ModelRegistry } from './models';
import type { ControllerMeta, ParsedEndpoint } from './types';
export declare function emitClientFile(classDecl: ClassDeclaration, ctrlMeta: ControllerMeta, endpoints: ParsedEndpoint[], registry: ModelRegistry, cfg: GeneratorConfig): string;
