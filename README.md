# DevVault Backend

NestJS backend for DevVault with PostgreSQL, Prisma, Redis caching, and BullMQ jobs.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template if needed:

```bash
cp .env.example .env
```

3. Start the API in watch mode:

```bash
npm run start:dev
```

## Docker stack

Phase 7 runs the full local stack with:

- NestJS API on `http://localhost:5000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

Start everything:

```bash
npm run docker:up
```

Stop everything:

```bash
npm run docker:down
```

Tail API logs:

```bash
npm run docker:logs
```

The API container waits for PostgreSQL and Redis to become healthy, applies Prisma migrations with `prisma migrate deploy`, and then starts the production build.

## Tests

```bash
npm run test
npm run test:e2e
```
