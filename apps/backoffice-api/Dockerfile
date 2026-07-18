FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches ./patches
COPY apps/backoffice-api/package.json ./apps/backoffice-api/
COPY apps/backoffice-client/package.json ./apps/backoffice-client/
COPY libs/backoffice/dtos/package.json ./libs/backoffice/dtos/
COPY libs/backoffice/types/package.json ./libs/backoffice/types/
COPY libs/shared/nest/package.json ./libs/shared/nest/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/utils/package.json ./libs/shared/utils/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backoffice-api/node_modules ./apps/backoffice-api/node_modules
COPY --from=deps /app/libs/backoffice/dtos/node_modules ./libs/backoffice/dtos/node_modules
COPY --from=deps /app/libs/shared/nest/node_modules ./libs/shared/nest/node_modules
COPY . .
RUN npx nx build backoffice-api
RUN npx tsc --outDir apps/backoffice-api/dist-migrations \
  --module commonjs --target es2021 --moduleResolution node \
  --esModuleInterop --skipLibCheck --declaration false \
  apps/backoffice-api/database.config.ts apps/backoffice-api/migrations/*.ts

# Production
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backoffice-api/node_modules ./apps/backoffice-api/node_modules
COPY --from=build /app/apps/backoffice-api/dist ./apps/backoffice-api/dist
COPY --from=build /app/apps/backoffice-api/dist-migrations ./apps/backoffice-api/dist-migrations
COPY apps/backoffice-api/package.json ./apps/backoffice-api/package.json
EXPOSE 3100
WORKDIR /app/apps/backoffice-api
CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist-migrations/database.config.js && node dist/main.js"]
