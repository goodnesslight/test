# Platform Apps

## Installation

```bash
Windows: git clone https://yevhieniimaiboroda1@bitbucket.org/cs2-coach/platform-app.git
Linux: git clone git@bitbucket.org:cs2-coach/platform-app.git

cd platform-app

pnpm install

cp apps/erp-api/.env.example apps/erp-api/.env
cp apps/erp-client/.env.example apps/erp-client/.env
```

## Running

```bash
docker compose -f docker-compose.dev.yml up -d

pnpm --filter erp-api migration:run

pnpm nx run erp-api:serve
pnpm nx run erp-client:serve
```
