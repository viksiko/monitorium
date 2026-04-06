/** `bundle` — все модели и enum в `models/index.ts`. `split` — файл на каждое имя экспорта (`UserModel.ts`, `TokenType.ts`, …) + `index.ts` как barrel. */
export type ModelsLayout = 'bundle' | 'split';
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
}
export declare const defaultBuiltinTypeNames: Set<string>;
export declare const defaultGeneratorConfig: Omit<GeneratorConfig, 'repoRoot'>;
export declare function mergeConfig(partial: Partial<GeneratorConfig> & {
    repoRoot: string;
}): GeneratorConfig;
