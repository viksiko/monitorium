# --- STAGE 1: BUILDER ---
FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

# Копируем КОРНЕВОЙ package.json и lock, чтобы npm видел workspaces
COPY package.json package-lock.json ./

# Копируем весь monorepo structure, но без node_modules
COPY packages ./packages
COPY apps/backend ./apps/backend

# Устанавливаем ВСЕ зависимости монорепо (включая @monorepo/types)
RUN npm install --ignore-scripts

# Prisma generate — БЕЗ DATABASE_URL
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Сборка пакета с типами
RUN npm run build --workspace=@monorepo/types

# Сборка Backend
RUN npm run build --workspace=back

# --- STAGE 2: PRODUCTION ---
FROM node:22-slim

WORKDIR /app
RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/prisma.config.ts ./prisma.config.ts

CMD ["sh", "-c", "npx prisma migrate deploy --schema ./prisma/schema.prisma && node dist/main"]
