FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches ./patches
COPY apps/website-api/package.json ./apps/website-api/
COPY apps/website-client/package.json ./apps/website-client/
COPY libs/shared/dtos/package.json ./libs/shared/dtos/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/utils/package.json ./libs/shared/utils/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/website-api/node_modules ./apps/website-api/node_modules
COPY --from=deps /app/libs/shared/dtos/node_modules ./libs/shared/dtos/node_modules
COPY . .
RUN npx nx build website-api
RUN npx tsc --outDir apps/website-api/dist-migrations \
  --module commonjs --target es2021 --moduleResolution node \
  --esModuleInterop --skipLibCheck --declaration false \
  apps/website-api/database.config.ts apps/website-api/migrations/*.ts

# Production
FROM base AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/website-api/node_modules ./apps/website-api/node_modules
COPY --from=build /app/apps/website-api/dist ./apps/website-api/dist
COPY --from=build /app/apps/website-api/dist-migrations ./apps/website-api/dist-migrations
COPY apps/website-api/package.json ./apps/website-api/package.json
EXPOSE 3000
WORKDIR /app/apps/website-api
CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist-migrations/database.config.js && node dist/main.js"]
