# Database setup

ClientDocs uses PostgreSQL with Prisma schema at:

- `src/database/schema/prisma.schema`

## Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`

## Infra-db and DBGate

If you use your local infra-db Docker stack (`C:/Users/santi/.infra-db`), configure `DATABASE_URL` in `.env` with that PostgreSQL port and credentials.

Example:

`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clientdocs`

Then run:

1. `npm run db:migrate`
2. `npm run db:seed`

After that you can inspect data with DBGate or Prisma Studio.
