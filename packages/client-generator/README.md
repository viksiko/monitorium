# @monorepo/client-generator

Генерация типизированного HTTP-клиента по **NestJS-контроллерам** без OpenAPI: разбор AST через `ts-morph`.

## Возможности

- Обход `*.controller.ts` под `apps/backend/src` с резолвом путей из `tsconfig` бэкенда.
- Типы из **общего пакета** (`sharedTypesPackage`) подключаются через `import type`, **не дублируются** в `models`.
- DTO и интерфейсы бэкенда превращаются в генерируемые интерфейсы с настраиваемым **суффиксом** (или без него).
- Режим вывода моделей: **один файл** или **отдельный файл на каждую модель/enum**.
- Запросы идут через **mutator** (как в Orval): один axios-инстанс с интерсепторами.

## Запуск

Из корня монорепозитория:

```bash
npm run api:generate
```

или:

```bash
npm run generate --workspace=@monorepo/client-generator
```

Перед первым запуском выполните `npm install` в корне.

## Конфигурация

Тип конфига: `GeneratorConfig` ([`src/config.ts`](src/config.ts)). В CLI по умолчанию задаётся объект в [`src/cli.ts`](src/cli.ts) и передаётся в `mergeConfig()` — правьте его под свой репозиторий или вызывайте `generate(mergeConfig({ ... }))` из своего скрипта.

### Свойства

| Свойство | Тип | Пример | Описание |
|----------|-----|--------|----------|
| `repoRoot` | `string` | `path.resolve(__dirname, '../..')` | **Обязательно.** Абсолютный путь к корню монорепы. |
| `backendTsconfig` | `string` | `'apps/backend/tsconfig.json'` | Путь к `tsconfig` бэкенда **относительно `repoRoot`**. Нужен для `paths` (`@src/*`, `@monorepo/types` и т.д.). |
| `sharedTypesPackage` | `string` | `'@monorepo/types'` | Имя npm-пакета общих типов. Импорты из этого модуля (и `имя/types`) не попадают в сгенерированные `models` как копии — в клиенте остаётся `import type { … } from '@monorepo/types'`. |
| `mutatorImportPath` | `string` | `'@/lib/mutator'` | Путь импорта модуля с HTTP-обёрткой на фронте (должен экспортировать `mutatorExportName`). |
| `mutatorExportName` | `string` | `'customInstance'` | Имя функции в mutator: `(config, options?) => Promise<T>`, внутри обычно axios. |
| `outputDir` | `string` | `'apps/frontend/src/lib/generated'` | Каталог относительно `repoRoot`: сюда пишутся `models/`, `*.client.ts`, корневой `index.ts`. |
| `globalPrefix` | `string` | `'api'` | Первый сегмент URL, как в `setGlobalPrefix` Nest. Итоговые пути вида `/${globalPrefix}/v${version}/…`. |
| `modelsLayout` | `'bundle' \| 'split'` | `'bundle'` | **`bundle`** — все модели и enum в одном `models/index.ts`. **`split`** — файл на каждый экспорт (`UserModel.ts`, `TokenType.ts`, …) плюс `models/index.ts` с `export * from './…'`. При каждой генерации старые `*.ts` в `models/` удаляются. |
| `modelSuffix` | `string \| null` | `'Model'` или `null` | Суффикс к имени class/interface бэкенда: `CreatePostDto` → `CreatePostDtoModel`. **`null` или `''`** — без суффикса (`CreatePostDto` → `CreatePostDto`). Внимание: без суффикса выше риск совпадения имён с типами из `sharedTypesPackage`. |
| `strictTypes` | `boolean` | `false` | Если `true`, генератор падает при непереносимых типах в полях (например ссылки на Prisma). Если `false`, такие места подменяются на `unknown`. |
| `builtinTypeNames` | `Set<string>` | см. `defaultBuiltinTypeNames` | Идентификаторы, которые не считаются «пользовательскими» при обходе `TypeReference` (`Promise`, `Date`, `Record`, …). |

### Пример полного конфига (как в CLI)

```typescript
import path from 'path';
import { mergeConfig, generate } from '@monorepo/client-generator';

const cfg = mergeConfig({
    repoRoot: path.resolve(__dirname, '../..'), // корень монорепы
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'bundle', // или 'split'
    modelSuffix: 'Model', // или null — без суффикса
    strictTypes: false,
});

await generate(cfg);
```

### Примеры отдельных опций

**Только отдельные файлы моделей:**

```typescript
mergeConfig({
    repoRoot,
    modelsLayout: 'split',
});
```

**Без суффикса `Model` (имя DTO = имя интерфейса в клиенте):**

```typescript
mergeConfig({
    repoRoot,
    modelSuffix: null,
});
```

**Строгая проверка типов (без «тихого» `unknown`):**

```typescript
mergeConfig({
    repoRoot,
    strictTypes: true,
});
```

## Выходные файлы

- `generated/models/index.ts` — все модели (`bundle`) или barrel (`split`).
- `generated/<controller>.client.ts` — объект `export const post = { … }` (имя из `PostController`).
- `generated/index.ts` — реэкспорт всех клиентов.

Импорт моделей в клиентах остаётся `from './models/index'` — для `split` barrel тот же.

## Ограничения

- Параметры с `@Req()` / `@Res()` в сигнатуру клиента не попадают.
- Prisma и прочие `node_modules` в полях моделей: `unknown` или ошибка при `strictTypes`.
- Сложные utility-типы в возвращаемых типах могут потребовать доработки генератора или ручной правки.

## Программный API

```typescript
import { mergeConfig, generate, defaultGeneratorConfig } from '@monorepo/client-generator';
import type { GeneratorConfig, ModelsLayout } from '@monorepo/client-generator';
```
