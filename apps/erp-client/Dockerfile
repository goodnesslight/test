FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches ./patches
COPY apps/erp-api/package.json ./apps/erp-api/
COPY apps/erp-client/package.json ./apps/erp-client/
COPY libs/erp/dtos/package.json ./libs/erp/dtos/
COPY libs/erp/types/package.json ./libs/erp/types/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/utils/package.json ./libs/shared/utils/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/erp-client/node_modules ./apps/erp-client/node_modules
COPY --from=deps /app/libs/erp/dtos/node_modules ./libs/erp/dtos/node_modules
COPY . .
RUN npx nx build erp-client

# Production
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/apps/erp-client/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
