import type { Project } from 'ts-morph';
import type { StructDecl } from './types';
/** `bundle` — все модели и enum в `models/index.ts`. `split` — файл на каждое имя экспорта (`UserModel.ts`, `TokenType.ts`, …) + `index.ts` как barrel. */
export type ModelsLayout = 'bundle' | 'split';
/**
 * Контекст, передаваемый плагинам на этапе разрешения внешних типов.
 * Плагин записывает результаты в `externalTypeAliases`.
 */
export interface ExternalTypesCtx {
    cfg: GeneratorConfig;
    /** ts-morph Project бэкенда (для разрешения node_modules .d.ts через TypeScript) */
    project: Project;
    /** Модели после topoSort — плагин ищет в них внешние ссылки */
    sorted: StructDecl[];
    /** Карта: имя внешнего типа → строковые значения union. Плагины пишут сюда. */
    externalTypeAliases: Map<string, string[]>;
}
export interface GeneratorPlugin {
    name: string;
    /** Разрешить внешние типы (Prisma enum и т.п.) в строковые union-значения */
    resolveExternalTypes?(ctx: ExternalTypesCtx): Promise<void>;
    /** Хук после записи всех сгенерированных файлов */
    afterWrite?(outDir: string, cfg: GeneratorConfig): Promise<void>;
}
export interface GeneratorConfig {
    /** Монорепозиторий: абсолютный путь к корню */
    repoRoot: string;
    /** Относительный путь к `tsconfig` бэкенда (от `repoRoot`) */
    backendTsconfig: string;
    /** npm-имя пакета общих типов; такие типы не дублируются в `models`, подключаются через `import type` */
    sharedTypesPackage: string;
    /** Путь импорта mutator на фронте (как в Orval), например `@/lib/mutator` */
    mutatorImportPath: string;
    /** Имя экспортируемой функции из модуля mutator */
    mutatorExportName: string;
    /** Каталог вывода относительно `repoRoot` (создаётся `…/models/`, `*.client.ts`, `index.ts`) */
    outputDir: string;
    /** Префикс URL как в `setGlobalPrefix` Nest (часто `api`) */
    globalPrefix: string;
    /**
     * Режим вывода моделей.
     * - `bundle` — один `models/index.ts`
     * - `split` — отдельный `*.ts` на каждый сгенерированный интерфейс и enum
     */
    modelsLayout: ModelsLayout;
    /**
     * Суффикс имён сгенерированных интерфейсов к имени class/interface бэкенда (`CreatePostDto` → `CreatePostDtoModel`).
     * `null` или пустая строка — без суффикса (`CreatePostDto` → `CreatePostDto`). Осторожно: возможны коллизии с типами из `sharedTypesPackage`.
     */
    modelSuffix: string | null;
    /** Если true — падать при непереносимых типах (например Prisma в полях); иначе подставлять `unknown` */
    strictTypes: boolean;
    /** Идентификаторы, не считающиеся пользовательскими типами при разборе ссылок */
    builtinTypeNames: Set<string>;
    /** Плагины pipeline генератора. Порядок важен: каждый плагин вызывается последовательно. */
    plugins: GeneratorPlugin[];
}
export declare const defaultBuiltinTypeNames: Set<string>;
export declare const defaultGeneratorConfig: Omit<GeneratorConfig, 'repoRoot'>;
export declare function mergeConfig(partial: Partial<GeneratorConfig> & {
    repoRoot: string;
}): GeneratorConfig;
