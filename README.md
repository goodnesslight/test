# Platform Apps

## Installation

```bash
Windows: git clone https://yevhieniimaiboroda1@bitbucket.org/cs2-coach/platform-app.git
Linux: git clone git@bitbucket.org:cs2-coach/platform-app.git

cd platform-app

pnpm install

cp apps/website-api/.env.example apps/website-api/.env
cp apps/website-client/.env.example apps/website-client/.env
```

## Running

```bash
docker compose -f docker-compose.dev.yml up -d

pnpm --filter website-api migration:run

pnpm nx run website-api:serve
pnpm nx run website-client:serve
```
