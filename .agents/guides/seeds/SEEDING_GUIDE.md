# Руководство по системе сидинга данных

Этот документ предназначен для AI-агентов и разработчиков, которые создают, модифицируют или расширяют систему сидинга.

## Используемые гайды

| Гайд | Описание |
|------|----------|
| [GIT_GUIDE.MD](../git/GIT_GUIDE.MD) | Просмотр изменений ветки через git |

---

## Обзор архитектуры

```
prisma/seed/
├── seed.ts                  # Точка входа — главный оркестратор
├── seed-data.json           # Заготовленные пользователи (plain passwords)
├── seed-output.json         # Генерируется после запуска (credentials)
└── factories/
    ├── district.factory.ts          # Статические округа и территории
    ├── user.factory.ts              # Пользователи с bcrypt-паролем
    ├── voter-profile.factory.ts     # Профиль избирателя
    ├── representative-profile.factory.ts  # Профиль представителя
    ├── task.factory.ts              # Задачи
    ├── task-stage.factory.ts        # Этапы задач
    ├── post.factory.ts              # Посты блога
    ├── comment.factory.ts           # Комментарии (полиморфные)
    ├── subscription.factory.ts      # Подписки voter → representative
    ├── dialog.factory.ts            # Диалоги
    ├── message.factory.ts           # Сообщения в диалогах
    ├── notification.factory.ts      # Демо-уведомления (по подпискам, задачам, постам и т.д.)
    └── balance-transaction.factory.ts  # Транзакции баланса
```

---

## Важно: Prisma 7 + драйвер-адаптер

Этот проект использует **Prisma 7** с `@prisma/adapter-pg`. Это означает, что `new PrismaClient()` без адаптера **не работает** и вызывает ошибку `Cannot read properties of undefined (reading '__internal')`.

В `seed.ts` клиент создаётся так:

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
```

Никогда не создавайте `new PrismaClient()` без адаптера в контексте этого проекта. Все фабрики принимают `prisma` как параметр — клиент создаётся единожды в `seed.ts`.

---

## Как запустить

```bash
# Из корня монорепо
npm run db:seed

# Из apps/backend напрямую
npm run prisma:seed

# Через Prisma CLI (если настроен prisma.seed в package.json)
npx prisma db seed
```

Seed безопасно запускать повторно:
- Пользователи из `seed-data.json` пропускаются если уже существуют (проверка по `email`)
- Округа и территории используют `upsert` (idempotent)
- Профили создаются только если их ещё нет

---

## Граф зависимостей моделей

```
District (статические данные) ←──────────────────┐
    ↓                                             │
User (VOTER / REPRESENTATIVE / ADMIN)             │
    ↓ (VOTER)          ↓ (REPRESENTATIVE)         │
VoterProfile     RepresentativeProfile            │
    ↓                   ↓                         │
    └──────────┬─────── Task ────────────────────→┘
               │         ↓
               │       TaskStage
               │
               └──── Post
                       ↓
Comment ←── (Task | Post) + User (автор)

Subscription: VOTER → REPRESENTATIVE
Dialog: VOTER ↔ REPRESENTATIVE (только при наличии Subscription)
Message: Dialog + User (sender)
BalanceTransaction: User (VOTER) + VoterProfile

Notification: User + опционально Subscription | Task | Post | Comment | Message
```

---

## Формат `seed-data.json`

Файл содержит заготовленных пользователей с **plain-text паролями**. При сидинге пароли хешируются через `bcrypt.hash(password, 10)`.

```json
{
  "users": [
    {
      "name": "Имя Фамилия",
      "email": "email@example.com",
      "password": "PlainPassword123!",
      "role": "ADMIN" | "VOTER" | "REPRESENTATIVE",

      // Только для REPRESENTATIVE:
      "districtName": "Округ №1",          // Должен совпадать с name в таблице districts
      "position": "Депутат городской думы", // Обязательно для REPRESENTATIVE
      "party": "Единая Россия",            // Опционально
      "bio": "Текст биографии"             // Опционально
    }
  ]
}
```

### Правила добавления пользователей:
1. `email` должен быть уникальным в системе
2. `password` — сложный пароль (минимум 8 символов, буквы + цифры)
3. Для `REPRESENTATIVE` обязательно указать `districtName` с названием существующего округа
4. `districtName` должен точно совпадать со значением из `district.factory.ts` (например: `"Округ №1"`, `"Округ №15"`)
5. Если пользователь с таким `email` уже есть в БД — он будет пропущен без ошибки

---

## Формат `seed-output.json`

Генерируется автоматически при каждом запуске. Содержит credentials всех созданных пользователей (включая сгенерированных faker).

```json
{
  "seededAt": "2026-04-12T10:00:00.000Z",
  "users": [
    {
      "id": "clxxxxx...",
      "name": "Имя пользователя",
      "email": "email@example.com",
      "password": "PlainPassword123!",  // plain-text для удобства тестирования
      "role": "ADMIN"
    }
  ]
}
```

> **Важно:** `seed-output.json` добавлен в `.gitignore` (рекомендуется). Не коммитьте файл с паролями в репозиторий.

---

## Как добавить новую фабрику

### 1. Создайте файл `factories/my-model.factory.ts`

```typescript
import { faker } from '@faker-js/faker/locale/ru';
import { PrismaClient } from '@prisma/client';

// ВАЖНО: Не создавайте PrismaClient напрямую внутри фабрики.
// Принимайте его как параметр из seed.ts, где он создаётся с адаптером PrismaPg.

export interface MyModelInput {
  requiredField: string;
  optionalField?: string;
}

/**
 * Создаёт MyModel.
 *
 * Правила:
 * - requiredField обязателен
 * - optionalField — ...
 */
export async function createMyModel(
  prisma: PrismaClient,
  input: MyModelInput,
) {
  return prisma.myModel.create({
    data: {
      requiredField: input.requiredField,
      optionalField: input.optionalField ?? faker.lorem.word(),
    },
  });
}
```

### 2. Добавьте импорт и вызов в `seed.ts`

Строго соблюдайте порядок — сначала создаются сущности без зависимостей, затем те, что ссылаются на уже созданные.

### 3. Документируйте зависимости

В JSDoc каждой функции укажите:
- `Зависит от:` — какие модели должны существовать до вызова
- `Ограничения:` — уникальность, обязательные поля
- `Условия:` — бизнес-логика (хеширование, enum-значения и т.д.)

---

## Важные бизнес-правила

### Пользователи (User)
| Поле | Правило |
|------|---------|
| `password` | Всегда хешируется `bcrypt.hash(password, 10)` — как в `UserService.createUser` |
| `isVerified` | `true` при сидинге (обходим email-верификацию) |
| `isActive` | `true` для VOTER и ADMIN, `true` для REPRESENTATIVE при сидинге |
| `isRepresentative` | `true` только если `role === 'REPRESENTATIVE'` |
| `districtId` | Обязателен для REPRESENTATIVE, nullable для VOTER |

### Задачи (Task)
| Поле | Правило |
|------|---------|
| `districtId` | Берётся из `assignee.districtId` — представитель отвечает за свой округ |
| `authorId` | Только VOTER создаёт задачи (представители власти — исполнители, не авторы) |
| `assigneeId` | Обязателен, только REPRESENTATIVE; статистика `tasksTotal/tasksCompleted` считается по `assigneeId` |
| Баланс | При сидинге **не списывается** — обходим transactional guard |

### Комментарии (Comment)
| Поле | Правило |
|------|---------|
| `postId` | Один из двух (XOR с taskId) — не оба одновременно |
| `taskId` | Один из двух (XOR с postId) — не оба одновременно |

### Подписки (Subscription)
| Поле | Правило |
|------|---------|
| `[subscriberId, representativeId]` | Уникальная пара — дублирование игнорируется через try/catch |
| `subscriberId` | Только VOTER |
| `representativeId` | Только REPRESENTATIVE |

### Диалоги (Dialog)
| Поле | Правило |
|------|---------|
| `[voterId, representativeId]` | Уникальная пара |
| Создаются | Только для пар с активной подпиской |

### Баланс (BalanceTransaction)
| Поле | Правило |
|------|---------|
| `balanceAfter` | Рассчитывается накопительно от нуля |
| Первая транзакция | Всегда `REGISTRATION_BONUS` (CREDIT, +10) |
| Баланс не уходит ниже 0 | DEBIT-транзакция пропускается если средств недостаточно |
| `VoterProfile.balance` | Синхронизируется с финальным `balanceAfter` |

### Уведомления (Notification)
| Поле / поведение | Правило |
|------------------|---------|
| Идемпотентность шага | Перед вставкой демо-данных выполняется `deleteMany` по таблице уведомлений — повторный seed даёт предсказуемый набор |
| `userId` | Получатель уведомления (как в `NotificationService.createAndSendNotification`) |
| Связи | `subscriptionId` / `taskId` / `postId` / `commentId` / `messageId` заполняются только там, где уместно по типу |

---

## Enums (Prisma)

```typescript
Role:                   VOTER | REPRESENTATIVE | ADMIN
TaskStatus:             PLANNED | IN_PROGRESS | COMPLETED | REJECTED
BalanceTransactionType: REGISTRATION_BONUS | WATCH_AD | REPRESENTATIVE_SUBSCRIPTION
                        CREATE_TASK | MESSAGE_REPRESENTATIVE | PURCHASE_TICKETS
TransactionDirection:   CREDIT | DEBIT
TokenType:              REFRESH | VERIFY_EMAIL | RESET_PASSWORD
NotificationType:       NEW_SUBSCRIBER | NEW_TASK_ASSIGNED | TASK_STATUS_CHANGED | NEW_POST | NEW_COMMENT | NEW_MESSAGE
```

---

## Конфигурация количества генерируемых данных

В `seed.ts` есть объект `CONFIG`:

```typescript
const CONFIG = {
  generatedVotersCount: 20,        // Количество сгенерированных VOTER
  generatedRepresentativesCount: 5, // Количество сгенерированных REPRESENTATIVE
  tasksCount: 30,                   // Общее количество задач
  postsCount: 15,                   // Общее количество постов
};
```

Измените значения для нужд тестирования/разработки.

---

## Что НЕ сидится

- `Token` — токены аутентификации/верификации (создаются только при реальных запросах)
- `TaskFile`, `PostFile` — файлы (требуют реального S3/CDN)
- OAuth поля (`gosuslugiId`, `sberId`, `tinkoffId`) — только для real OAuth flow

---

## Добавление округов

Все округа хранятся статически в `factories/district.factory.ts` в константе `DISTRICT_DATA`. Для добавления нового округа:

```typescript
{ name: 'Округ №35', mapId: 116, areas: ['Название территории'] },
```

`mapId` — уникальный ID из Яндекс.Карты. Использует `upsert`, безопасно для повторного запуска.

---

## Примечание для AI-агентов: фиксация бизнес-правил

Если пользователь при постановке задачи указывает **специфичные бизнес-правила** для конкретной модели — их необходимо:

1. **Соблюсти в реализации фабрики** — правило должно быть отражено в логике функции, а не только в комментарии.

2. **Зафиксировать в JSDoc функции** в блоке `Условия:` или `Правила:`, чтобы следующий агент знал об ограничении.

3. **Обновить таблицу** в разделе «Важные бизнес-правила» данного документа для соответствующей модели.

### Примеры правил, которые нужно фиксировать

| Тип правила | Пример |
|-------------|--------|
| Ограничение на роль | «Задачи могут создавать только VOTER» |
| Обязательная связь | «`assigneeId` задачи всегда заполнен» |
| Зависимость между полями | «`districtId` задачи берётся из `assignee.districtId`» |
| Порядок операций | «Подписки создаются до задач — задачу можно ставить только подписанному депутату» |
| Гарантия данных | «Каждый preloaded voter получает минимум 1 задачу на каждого своего депутата» |
| Хеширование | «Пароль хешируется `bcrypt(rounds=10)` — как в `UserService.createUser`» |

### Что делать при изменении схемы Prisma

Если в `schema.prisma` добавлена или изменена модель:

1. Прочитайте этот гайд полностью.
2. Изучите изменения ветки через **[GIT_GUIDE.MD](../git/GIT_GUIDE.MD)** — он описывает правильный способ просмотра diff'а относительно базовой ветки проекта (`dev`). Не сравнивай произвольное число коммитов и не используй `main`/`master` как базу, если пользователь не указал иное.
3. Создайте или обновите соответствующую фабрику в `factories/`.
4. Определите место модели в графе зависимостей и добавьте вызов в нужном месте `seed.ts`.
5. Если у модели есть специфические бизнес-правила — уточните их у пользователя и зафиксируйте по схеме выше.
6. Обновите раздел «Важные бизнес-правила» и граф зависимостей в этом документе.
