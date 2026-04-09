# @monorepo/client-generator

Генерация типизированного HTTP-клиента по **NestJS-контроллерам** без OpenAPI: разбор AST через `ts-morph`.

## Возможности

- Обход `*.controller.ts` под `apps/backend/src` с резолвом путей из `tsconfig` бэкенда.
- Типы из **общего пакета** (`sharedTypesPackage`) подключаются через `import type`, **не дублируются** в `models`.
- DTO и интерфейсы бэкенда превращаются в генерируемые интерфейсы с настраиваемым **суффиксом** (или без него).
- Режим вывода моделей: **один файл** или **отдельный файл на каждую модель/enum**.
- Запросы идут через **mutator** (как в Orval): один axios-инстанс с интерсепторами.
- **Plugin pipeline** — подключаемые модули для разрешения внешних типов (Prisma enum и т.п.).

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
| `modelSuffix` | `string \| null` | `'Model'` или `null` | Суффикс к имени class/interface бэкенда: `CreatePostDto` → `CreatePostDtoModel`. **`null` или `''`** — без суффикса. Внимание: без суффикса выше риск совпадения имён с типами из `sharedTypesPackage`. |
| `strictTypes` | `boolean` | `false` | Если `true`, генератор падает при непереносимых типах в полях (например ссылки на `node_modules`, не разрешённые плагином). Если `false`, такие места подменяются на `unknown`. |
| `builtinTypeNames` | `Set<string>` | см. `defaultBuiltinTypeNames` | Идентификаторы, которые не считаются «пользовательскими» при обходе `TypeReference` (`Promise`, `Date`, `Record`, …). |
| `plugins` | `GeneratorPlugin[]` | `[prismaPlugin]` | Плагины pipeline. Вызываются после `topoSort`, до записи `models/`. Каждый плагин может разрешить внешние типы в string-union значения. По умолчанию `[]`. |

### Пример полного конфига (`.cjs`)

```javascript
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');

module.exports = {
    repoRoot,
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'split',   // 'bundle' — один файл, 'split' — файл на каждую модель
    modelSuffix: 'Model',    // null — без суффикса
    strictTypes: false,
    // Встроенный плагин Prisma: дублирует enum-типы из @prisma/client во фронтенд
    plugins: ['prisma'],
};
```

Программно (TypeScript):

```typescript
import path from 'path';
import { mergeConfig, generate, prismaPlugin } from '@monorepo/client-generator';

const cfg = mergeConfig({
    repoRoot: path.resolve(__dirname, '../..'),
    backendTsconfig: 'apps/backend/tsconfig.json',
    sharedTypesPackage: '@monorepo/types',
    mutatorImportPath: '@/lib/mutator',
    mutatorExportName: 'customInstance',
    outputDir: 'apps/frontend/src/lib/generated',
    globalPrefix: 'api',
    modelsLayout: 'split',
    modelSuffix: 'Model',
    strictTypes: false,
    plugins: [prismaPlugin],
});

await generate(cfg);
```

### Примеры отдельных опций

**Только отдельные файлы моделей:**

```typescript
mergeConfig({ repoRoot, modelsLayout: 'split' });
```

**Без суффикса `Model`:**

```typescript
mergeConfig({ repoRoot, modelSuffix: null });
```

**Строгая проверка типов:**

```typescript
mergeConfig({ repoRoot, strictTypes: true });
```

## Plugin pipeline

### Интерфейс плагина

```typescript
interface GeneratorPlugin {
    name: string;
    /** Вызывается после topoSort, до записи models/. Плагин пишет в ctx.externalTypeAliases. */
    resolveExternalTypes?(ctx: ExternalTypesCtx): Promise<void>;
    /** Вызывается после записи всех файлов. Можно добавить свои файлы (Zod-схемы, документация и т.п.). */
    afterWrite?(outDir: string, cfg: GeneratorConfig): Promise<void>;
}

interface ExternalTypesCtx {
    cfg: GeneratorConfig;
    project: Project;          // ts-morph Project бэкенда
    sorted: StructDecl[];      // модели после topoSort
    externalTypeAliases: Map<string, string[]>; // имя → массив строковых значений union
}
```

Плагины вызываются последовательно в порядке массива `plugins`. Все плагины разделяют один `externalTypeAliases` — каждый последующий видит результаты предыдущих.

### Пример кастомного плагина

```javascript
// client-generator.config.cjs
module.exports = {
    // ...
    plugins: [
        'prisma',  // встроенный
        {
            name: 'my-enums',
            async resolveExternalTypes(ctx) {
                // добавить свой внешний тип вручную
                ctx.externalTypeAliases.set('Currency', ['RUB', 'USD', 'EUR']);
            },
            async afterWrite(outDir, cfg) {
                // например, генерировать Zod-схемы по записанным файлам
            },
        },
    ],
};
```

Строка `'prisma'` — псевдоним встроенного плагина. Полный список встроенных: **`prisma`**.

---

### Встроенный плагин `prisma`

**Подключение:** `plugins: ['prisma']` в конфиге или `plugins: [prismaPlugin]` программно.

#### Что делает

Дублирует **Prisma enum-типы** во фронтенд в виде `export type Role = "ADMIN" | "USER"` — без установки `@prisma/client` на фронте.

#### Какие типы дублируются

Плагин находит все поля DTO/интерфейсов бэкенда, тип которых импортирован из `@prisma/client` или `@prisma/*`, и для каждого такого имени собирает строковые значения.

**Дублируются:** только **enum-типы** Prisma. Примеры:

```prisma
enum Role    { ADMIN USER }
enum Status  { ACTIVE INACTIVE PENDING }
enum TaskStatus { TODO IN_PROGRESS DONE }
```

Если в DTO бэкенда есть поле `role: Role` — в `models/` будет создан файл `Role.ts`:

```typescript
/** @generated */

export type Role = "ADMIN" | "USER";
```

**Не дублируются:**

| Тип | Причина |
|-----|---------|
| `Prisma.JsonValue`, `Prisma.Decimal` | Utility-типы неймспейса `Prisma`, не имеют const-паттерна в `.d.ts`. Заменяются на `unknown` (при `strictTypes: false`). |
| Prisma model types (`User`, `Post`, …) | Должны быть скрыты за DTO бэкенда, не должны утекать в API-слой. |
| `@prisma/client` класс `PrismaClient` | Серверная зависимость, на фронте не нужна. |

#### Стратегия разрешения (порядок)

1. **`@prisma/client` `.d.ts` через ts-morph** — читает сгенерированный Prisma Client через TypeScript. Prisma генерирует enum как:
   ```typescript
   export declare const Role: { readonly ADMIN: "ADMIN"; readonly USER: "USER"; };
   ```
   Это даёт **точные строковые значения** с учётом `@map` в схеме.

2. **Fallback: `apps/backend/prisma/schema.prisma`** — если Prisma Client ещё не сгенерирован (или ts-morph не смог его разрешить), читает имена членов enum из схемы regex-парсером. Значения могут не совпадать с `@map`, поэтому это резервный вариант.

#### Пример с `@map`

```prisma
enum Status {
    ACTIVE   @map("active")
    INACTIVE @map("inactive")
}
```

- `.d.ts` путь (первичный) → `export type Status = "active" | "inactive"` ✓
- `schema.prisma` fallback → `export type Status = "ACTIVE" | "INACTIVE"` ✗

---

## Выходные файлы

- `generated/models/index.ts` — все модели (`bundle`) или barrel (`split`).
- `generated/<controller>.client.ts` — объект `export const post = { … }` (имя из `PostController`).
- `generated/index.ts` — реэкспорт всех клиентов.

Импорт моделей в клиентах остаётся `from './models/index'` — для `split` barrel тот же.

## Ограничения

- Параметры с `@Req()` / `@Res()` в сигнатуру клиента не попадают.
- Типы из `node_modules`, не разрешённые ни одним плагином: `unknown` или ошибка при `strictTypes: true`.
- `Prisma.JsonValue`, `Prisma.Decimal` и другие non-enum типы Prisma → `unknown`.
- Сложные utility-типы в возвращаемых типах могут потребовать доработки генератора или ручной правки.

## Программный API

```typescript
import { mergeConfig, generate, defaultGeneratorConfig, defaultBuiltinTypeNames, prismaPlugin } from '@monorepo/client-generator';
import type { GeneratorConfig, GeneratorPlugin, ExternalTypesCtx, ModelsLayout } from '@monorepo/client-generator';
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
  types.ts          — общие интерфейсы данных между модулями
  ast-helpers.ts    — чистые утилиты для работы с AST и путями
  parse.ts          — разбор контроллеров и методов NestJS
  models.ts         — реестр моделей, сбор зависимостей, генерация models/
  emit-client.ts    — генерация *.client.ts файлов
  generate.ts       — оркестрация: pipeline плагинов + запись файлов
  config.ts         — GeneratorConfig, ExternalTypesCtx, GeneratorPlugin, mergeConfig
  cli.ts            — точка входа CLI, разбор --config, резолв плагинов по имени
  plugins/
    prisma.ts       — встроенный плагин Prisma enum
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
  • parseControllerEndpoints()  — для каждого метода с @Get/@Post/…:
      - тип и имя @Body, @Query, @Param параметров (raw AST-текст)
      - возвращаемый тип (raw AST-текст)
      → ParsedEndpoint[]
      │
      ▼
[models.ts]  — собирает все модели из типов эндпоинтов:
  • collectModelsFromNode()  — TypeReference-имена из AST, регистрирует в ModelRegistry
  • expandModels() (BFS)  — транзитивно добавляет вложенные типы полей
  • topoSort()  — сортирует по зависимостям (используемый тип — раньше)
  • collectEnums()  — enum-ы, на которые ссылаются поля моделей
      │
      ▼
[Plugin pipeline: resolveExternalTypes]  — для каждого плагина из cfg.plugins:
  • плагин получает ExternalTypesCtx { cfg, project, sorted, externalTypeAliases }
  • пишет в externalTypeAliases: Map<typeName, string[]>
  ┌─────────────────────────────────────────────────────────────┐
  │ prisma plugin:                                              │
  │   1. ищет поля, импортированные из @prisma/*               │
  │   2. читает значения из @prisma/client .d.ts (ts-morph)     │
  │   3. fallback: парсит apps/backend/prisma/schema.prisma     │
  └─────────────────────────────────────────────────────────────┘
      │
      ▼
[models.ts: writeModels(externalTypeAliases)]  — пишет models/:
  bundle: один index.ts — import type из shared, external aliases, enum, interface
  split:  файл на каждый тип + barrel index.ts с export *
  Внешние типы из externalTypeAliases → export type Foo = "A" | "B"
  Типы без разрешения → unknown (или ошибка при strictTypes)
      │
      ▼
[Plugin pipeline: afterWrite]  — post-hook для каждого плагина
      │
      ▼
[emit-client.ts: emitClientFile()]  — для каждого контроллера:
  • buildUrl()  — URL-шаблон с encodeURIComponent для :param
  • buildFnParams()  — типизированная сигнатура функции
  • buildMutatorArgs()  — объект { url, method, data, params }
  • collectClientImports()  — import type из models/ и sharedTypesPackage
  → строка исходника *.client.ts
      │
      ▼
[generate.ts]  — пишет файлы на диск: *.client.ts, models/, index.ts
```

### Как обрабатываются типы

Генератор видит четыре категории типов:

**1. Типы из `sharedTypesPackage` (например `@monorepo/types`)**
Не копируются. В сгенерированном файле остаётся `import type { … } from '@monorepo/types'`.
Определяется по строке модуля в `import`-декларации исходника бэкенда.

**2. Классы и интерфейсы бэкенда (DTO, сущности)**
Превращаются в `interface` без декораторов, с именем `<Оригинал><modelSuffix>`.
Только backend-файлы (`apps/backend/src/`, `apps/backend/libs/`), не сервисы и не контроллеры.
Дерево зависимостей разворачивается BFS-обходом по полям каждого зарегистрированного типа.

**3. Внешние типы, разрешённые плагином**
Если плагин добавил имя в `externalTypeAliases`, генератор эмитирует `export type Foo = "A" | "B"`.
Встроенный `prismaPlugin` обрабатывает Prisma enum-ы таким образом.

**4. Неразрешённые типы из `node_modules`**
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

Поле `plugins` в файле конфига принимает массив строк (`'prisma'`) и/или объектов `GeneratorPlugin`. Строки раскрываются в встроенные плагины при старте CLI.
