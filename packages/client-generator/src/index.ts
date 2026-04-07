export { mergeConfig, defaultGeneratorConfig, defaultBuiltinTypeNames } from './config';
export type { GeneratorConfig, GeneratorPlugin, ExternalTypesCtx, ModelsLayout } from './config';
export { generate, type GenerateResult } from './generate';
export { prismaPlugin } from './plugins/prisma';
