import type { GeneratorConfig } from './config';
export interface GenerateResult {
    controllerFiles: string[];
    modelsIndex: string;
}
export declare function generate(cfg: GeneratorConfig): Promise<GenerateResult>;
