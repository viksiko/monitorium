# Monitorium

## Структура проекта

```
monitorium/
├── apps/
│   ├── backend/         # NestJS API-сервер
│   └── frontend/        # React (Vite) клиент
├── packages/
│   └── types/           # Общие TypeScript-типы (@monorepo/types)
├── .vscode/             # Конфигурация запуска для IDE
├── docker-compose.yml   # Docker-конфигурация (postgres, backend, frontend)
├── .env                 # Переменные окружения (единый файл для всего проекта)
├── .env.example         # Шаблон .env
└── package.json         # Корневой package (npm workspaces)
```

Все части проекта (бекенд, фронтенд, docker-compose) используют **один общий `.env` файл** в корне.

## Предварительные требования

- [Node.js](https://nodejs.org/) (версия 18 или выше)
- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-docker/) и Docker Compose
- [Cursor](https://cursor.com/) или VS Code

## Начальная настройка

1. **Клонируйте репозиторий и перейдите в него**

    ```bash
    git clone https://github.com/viksiko/monitorium.git
    cd monitorium
    ```

2. **Создайте ветку для разработки**

    ```bash
    git checkout dev
    git checkout -b my-branch
    ```

3. **Настройте переменные окружения**

    ```bash
    cp .env.example .env
    ```

    Откройте `.env` и заполните значения (порты, пароли БД, JWT-ключи).

4. **Установите зависимости**

    ```bash
    npm run install:all
    ```

## Разработка

Бекенд, фронтенд и базу данных можно запускать **независимо друг от друга** — как локально на машине, так и в Docker, в любой комбинации.

### Локальный запуск (рекомендуется для разработки)

Бекенд и фронтенд запускаются на вашей машине с hot-reload — изменения в коде применяются мгновенно.

#### 1. Поднимите базу данных

Бекенду нужен PostgreSQL. Проще всего запустить его в Docker:

```bash
docker compose up -d postgres
```

Можно также использовать PostgreSQL, установленный на машине напрямую. Главное — правильно указать хост и порт в `.env` (см. раздел «Настройка `.env` для разного окружения» ниже).

#### 2. Создайте структуру БД (при первом запуске или после изменения схемы)

```bash
npm run db:recreate
```

#### 3. Запустите приложение

**Через IDE (рекомендуется):** нажмите F5 — выберите **Full** (бек + фронт), **Back** или **Front**. Подробности в разделе «Запуск из IDE» ниже.

**Через терминал:**

```bash
npm run dev          # бекенд + фронтенд одной командой
npm run dev:back     # только бекенд
npm run dev:front    # только фронтенд
```

### Запуск в Docker

Бекенд, фронтенд и базу данных можно собрать в Docker-образы и запустить в контейнерах. Для этого нужен Docker — на Windows удобно использовать [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Запуск и остановка:

```bash
docker compose up -d                     # запустить всё (postgres + backend + frontend)
docker compose up -d postgres backend    # только БД и бекенд
docker compose up -d postgres frontend   # только БД и фронтенд
docker compose down                      # остановить всё
docker compose logs -f backend           # посмотреть логи бекенда
```

#### Пересборка образов

Docker кэширует собранные образы. Если вы внесли изменения в код бекенда или фронтенда — образ нужно пересобрать, иначе Docker запустит старую версию:

```bash
docker compose up -d --build                 # пересобрать всё и запустить
docker compose up -d --build backend         # пересобрать только бекенд
docker compose up -d --build frontend        # пересобрать только фронтенд
docker compose build backend frontend        # пересобрать образы без запуска
```

### Настройка `.env` для разного окружения

От того, где запущен бекенд, зависит как он находит базу данных. В `.env` нужно менять **две переменные**:

| Режим | Когда используется | `POSTGRES_HOST` | Порт в `DATABASE_URL` |
|---|---|---|---|
| **Локальная разработка** | `npm run dev` / F5 | `localhost` | `${POSTGRES_HOST_PORT}` |
| **Бекенд в Docker** | `docker compose up` | `postgres` | `${POSTGRES_DOCKER_PORT}` |

Docker-контейнеры общаются между собой по имени сервиса из `docker-compose.yml` — для них БД доступна как хост `postgres` на внутреннем порту. А с вашей машины (localhost) БД доступна только через проброшенный порт `POSTGRES_HOST_PORT`.

Пример `.env` для **локальной разработки** (бекенд на машине, БД в Docker):

```env
POSTGRES_HOST="localhost"
POSTGRES_HOST_PORT=5433
POSTGRES_DOCKER_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5433/${POSTGRES_DB}"
```

Пример `.env` для **Docker** (бекенд в контейнере):

```env
POSTGRES_HOST="postgres"
POSTGRES_HOST_PORT=5433
POSTGRES_DOCKER_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
```

Если бекенд не может подключиться к БД — первым делом проверяйте эти два значения.

## Общие типы (`packages/types`)

Общие интерфейсы и типы данных (DTO, модели), используемые и в бекенде, и во фронтенде. Все типы для взаимодействия между частями проекта должны быть определены здесь.

Импорт: `import { ... } from '@monorepo/types'`

## Документация API

После запуска бекенда доступна по адресу:

- **Swagger UI:** `/api/v1/docs`
- **OpenAPI спецификация:** `/api/v1/docs-json`

---

## Запуск из IDE (Cursor / VS Code)

Проект настроен для запуска через F5 — без терминала, с кнопками Stop/Restart.

### Как пользоваться

В панели отладки (выпадающий список слева от кнопки F5) выбрать конфигурацию и нажать F5:

- **Full** — бекенд + фронтенд в раздельных терминалах
- **Back** — только бекенд
- **Front** — только фронтенд

При запуске **Full** — если остановить один сервер, второй тоже остановится.
Чтобы перезапустить только один: остановить его кнопкой Stop → переключить выпадающий на **Back** или **Front** → нажать F5.

### Как это работает

Серверы (`nest` и `vite`) запускаются через `node` напрямую, минуя `npm` и `npx` — иначе на Windows отладчик теряет процесс (batch-обёртки `.cmd` порождают дочерний процесс и завершаются).

Пути к бинарникам (hoisted в корневой `node_modules` через npm workspaces):
- Бекенд: `node_modules/@nestjs/cli/bin/nest.js`
- Фронтенд: `node_modules/vite/bin/vite.js`

### Переменные окружения

Встроенный `envFile` в launch.json не умеет раскрывать ссылки типа `${API_PORT}`. Поэтому используется загрузчик `.vscode/dotenv-loader.js`, который через `dotenv` + `dotenv-expand` читает `.env` и раскрывает все ссылки до запуска серверов.

Загрузчик подключается через флаг `-r` (require) — node выполняет его **до** основной программы:

```
.env:  VITE_API_PORT=${API_PORT}             →  process.env.VITE_API_PORT = "3000"
.env:  DATABASE_URL=...${POSTGRES_HOST}...   →  полная строка подключения
```

### Сборка типов

`types:watch` (пересборка `@monorepo/types` при изменениях) вынесен в фоновую задачу (`tasks.json`). Каждая конфигурация запускает его автоматически перед стартом сервера.
