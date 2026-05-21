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
COPY --from=deps /app/apps/website-client/node_modules ./apps/website-client/node_modules
COPY --from=deps /app/libs/shared/dtos/node_modules ./libs/shared/dtos/node_modules
COPY . .
RUN npx nx build website-client

# Production
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/apps/website-client/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
