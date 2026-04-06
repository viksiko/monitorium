# @monorepo/client-generator

Генерация типизированного HTTP-клиента по **NestJS-контроллерам** без OpenAPI: разбор AST через `ts-morph`.

## Возможности

- Обход `*.controller.ts` под `apps/backend/src` с резолвом путей из `tsconfig` бэкенда.
- Типы из **общего пакета** (`sharedTypesPackage`) подключаются через `import type`, **не дублируются** в `models`.
- DTO и интерфейсы бэкенда превращаются в генерируемые интерфейсы с настраиваемым **суффиксом** (или без него).
- Режим вывода моделей: **один файл** или **отдельный файл на каждую модель/enum**.
- Запросы идут через **mutator** (как в Orval): один axios-инстанс с интерсепторами.

## Запуск

Из корня монорепозитория (рекомендуется — путь к конфигу уже прописан в `api:generate`):

```bash
npm run api:generate
```

Вручную с указанием файла конфигурации (путь от **текущей рабочей директории**, откуда вы запускаете `node`, либо абсолютный):

```bash
npm run generate --workspace=@monorepo/client-generator -- --config ../../apps/frontend/src/lib/client-generator.config.cjs
```

или из корня монорепы:

```bash
node packages/client-generator/dist/cli.js --config apps/frontend/src/lib/client-generator.config.cjs
```

Флаги: `--config` / `-c`.

Без `--config` CLI использует встроенные пути из [`src/cli.ts`](src/cli.ts) (режим для разработки пакета).

Перед первым запуском выполните `npm install` в корне.

## Файл конфигурации

Удобно держать конфиг рядом с mutator, например `apps/frontend/src/lib/client-generator.config.cjs`.

Поддерживаются:

- **`.cjs` / `.js`** — `module.exports = { ... }` (CommonJS). Можно вызывать `path.resolve(__dirname, …)` для `repoRoot`.
- **`.json`** — обычный JSON (без вычислений; `repoRoot` можно задать относительно расположения файла, см. ниже).

Обязательное поле: **`repoRoot`**. Если оно **относительное**, оно считается от **каталога файла конфига** (а не от `cwd`). Остальные пути (`backendTsconfig`, `outputDir`, …) по-прежнему относительны к `repoRoot` после `mergeConfig`.

Дальше значения из файла смешиваются с дефолтами через `mergeConfig()` (см. [`src/config.ts`](src/config.ts)).

## Конфигурация (тип `GeneratorConfig`)

Тип: `GeneratorConfig` ([`src/config.ts`](src/config.ts)). Программно: `generate(mergeConfig({ ... }))`.

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

---

## Устройство проекта

### Идея

Вместо генерации OpenAPI-спецификации и последующей обработки swagger-кодегеном — напрямую читаем TypeScript-исходники бэкенда через компилятор (`ts-morph`). Это даёт:
- точные типы без потери дженериков и union-типов;
- никакой промежуточной JSON-схемы;
- работу в монорепе без отдельного HTTP-сервера.

### Структура исходников

```
src/
  types.ts        — общие интерфейсы данных между модулями
  ast-helpers.ts  — чистые утилиты для работы с AST и путями
  parse.ts        — разбор контроллеров и методов NestJS
  models.ts       — реестр моделей, сбор зависимостей, генерация models/
  emit-client.ts  — генерация *.client.ts файлов
  generate.ts     — оркестрация: связывает все модули
  config.ts       — тип GeneratorConfig, дефолты, mergeConfig
  cli.ts          — точка входа CLI, разбор --config, запуск generate()
```

### Пайплайн генерации

```
tsconfig бэкенда
      │
      ▼
[ts-morph Project]  — загружает все исходники бэкенда с резолвом путей
      │
      ▼
[parse.ts]  — ищет *.controller.ts, для каждого класса с @Controller:
  • parseControllerMeta()  — читает path и version из декоратора
  • parseControllerEndpoints()  — для каждого публичного метода с @Get/@Post/…:
      - тип и имя каждого @Body, @Query, @Param параметра (raw AST-текст)
      - возвращаемый тип (raw AST-текст)
      → ParsedEndpoint[]
      │
      ▼
[models.ts]  — собирает все модели из типов эндпоинтов:
  • collectModelsFromNode()  — извлекает TypeReference-имена из AST-узла,
      резолвит class/interface, регистрирует в ModelRegistry
  • expandModels() (BFS)  — транзитивно добавляет вложенные типы полей
  • topoSort()  — сортирует по зависимостям (используемый тип — раньше)
  • collectEnums()  — собирает enum-ы, на которые ссылаются поля моделей
      │
      ▼
[models.ts: writeModels()]  — пишет models/:
  bundle: один index.ts со всеми interface и enum
  split:  файл на каждый тип + barrel index.ts с export *
      │
      ▼
[emit-client.ts: emitClientFile()]  — для каждого контроллера:
  • buildUrl()  — собирает URL-шаблон с encodeURIComponent для :param
  • buildFnParams()  — типизированная сигнатура функции
      (path params → string, @Body/@Query → mapped model type)
  • buildMutatorArgs()  — объект для customInstance({ url, method, data, params })
  • collectClientImports()  — определяет нужные import type из models/ и sharedTypesPackage
  → строка исходника *.client.ts
      │
      ▼
[generate.ts]  — пишет файлы на диск:
  *.client.ts, models/index.ts, index.ts (barrel)
```

### Как обрабатываются типы

Генератор видит три категории типов:

**1. Типы из `sharedTypesPackage` (например `@monorepo/types`)**
Не копируются. В сгенерированном файле остаётся `import type { … } from '@monorepo/types'`.
Определяется по строке модуля в `import`-декларации исходника бэкенда.

**2. Классы и интерфейсы бэкенда (DTO, сущности)**
Превращаются в `interface` без декораторов, с именем `<Оригинал><modelSuffix>`.
Только backend-файлы (`apps/backend/src/`, `apps/backend/libs/`), не сервисы и не контроллеры.
Дерево зависимостей разворачивается BFS-обходом по полям каждого зарегистрированного типа.

**3. Типы из `node_modules` (Prisma и прочие)**
Не могут быть перенесены на фронт. При `strictTypes: false` подменяются на `unknown`; при `strictTypes: true` — ошибка с указанием поля.

### ModelRegistry

Центральный объект пайплайна. Хранит:
- `modelName: Map<originalName, emittedName>` — отображение имён;
- `structs: Map<originalName, StructDecl>` — AST-узлы для генерации тел интерфейсов.

Метод `mapType(text)` подставляет все зарегистрированные имена в строку типа через `RegExp \bName\b`, от длинных к коротким (чтобы `CreatePostDto` не подменился раньше `Dto`).

### Версионирование

Генератор читает `version` из объектного аргумента `@Controller({ path: '...', version: '2' })`.
Если передана только строка пути `@Controller('posts')` — версия по умолчанию `'1'`.
Итоговый URL: `/${globalPrefix}/v${version}/${controllerPath}/${methodPath}`.

### Файл конфигурации и CLI

`cli.ts` принимает `--config path/to/file.cjs`. Если путь относительный — резолвится от `cwd`.
Поле `repoRoot` внутри файла конфига, если относительное, резолвится от **директории самого файла конфига** — это позволяет класть конфиг в любое место проекта без хардкода абсолютных путей.
