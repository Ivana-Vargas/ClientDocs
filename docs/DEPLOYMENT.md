# ClientDocs Deployment Guide

## Recommended stack

- App: Railway (Next.js)
- Database: Neon Postgres
- File storage: Cloudflare R2 (S3-compatible)
- Rate limiting (next phase): Redis/Upstash (replace in-memory limiter)

## Cost-first notes

- Expected low-cost start: app + db + storage around single-digit to low double-digit USD/month.
- Railway filesystem is ephemeral. Do not rely on local `uploads/` for production persistence.
- Use R2 for durable document storage before go-live.

## 1) Prepare environment variables

Copy `.env.example` and set secure values:

- `DATABASE_URL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `MANAGER_EMAIL`, `MANAGER_PASSWORD`
- `JWT_SECRET` (minimum 32 chars in production)
- `JWT_ISSUER`, `JWT_AUDIENCE`
- `DOCUMENT_STORAGE_PROVIDER` (`S3` in production)
- `R2_ENDPOINT`, `R2_REGION`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

Never commit real secrets.

## 2) Database initialization (production)

Run in CI/CD or server startup job:

```bash
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

Notes:

- Keep migration files in git. They are required for reproducible production state.
- Do not use `db:push` in production.

## 3) Railway deploy (app)

1. Create a new project in Railway and connect this GitHub repository.
2. Set environment variables from `.env.example`.
3. Build command: `npm run build`
4. Start command: `npm run start`
5. Set Node version to LTS (20+).
6. Configure health check path: `/api/health`.

## 4) Neon deploy (database)

1. Create Neon project and database.
2. Copy Neon connection string to `DATABASE_URL` in Railway.
3. Run once after first deploy:

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

4. Enable Neon automated backups and point-in-time restore.

## 5) Cloudflare R2 (documents)

1. Create R2 bucket, API token, and S3-compatible endpoint.
2. Configure app env vars for R2 credentials and bucket.
3. Verify upload + view + delete flows against R2.
4. Set `DOCUMENT_STORAGE_PROVIDER=S3` in production.
5. Keep local storage only for local development/testing.

## 6) Optional data cleanup before go-live

Default cleanup (sessions only):

```bash
npm run db:prepare:production
```

Full cleanup (clients/payments/documents/categories/sessions):

```bash
FULL_DB_CLEAN=true npm run db:prepare:production
```

Safety gate in production:

```bash
ALLOW_PRODUCTION_DB_CLEANUP=true FULL_DB_CLEAN=true npm run db:prepare:production
```

## 7) Build and run checks

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

## 8) Runtime security checklist

- Origin checks enabled for mutating endpoints (CSRF mitigation)
- Auth cookies use `httpOnly`, `sameSite=strict`, and `secure` in production
- Security headers + CSP enabled in `next.config.ts`
- File upload checks: MIME + PDF signature
- Local storage path traversal protection in place

## 9) Post-deploy operations

- Run auth session cleanup periodically:

```bash
npm run auth:sessions:cleanup
```

- Add monitoring/alerts for `401`, `403`, `429`, and `5xx` rates.
- Rotate `JWT_SECRET` and admin credentials periodically.

## 10) Final hardening tasks (recommended)

- Move rate limiting to Redis (shared across instances)
- Move document storage from local disk to S3/R2
- Add WAF rules in front of app
- Add CI SAST/DAST (CodeQL + OWASP ZAP baseline)
