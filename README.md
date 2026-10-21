# Order Tracking

Next.js + Tailwind + Drizzle + Neon Postgres. Admin panel at `/admin`, customer tracking at `/`.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` – Neon connection string
   - `AUTH_SECRET` – random string, 32+ chars
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH` – output of `npm run hash-password -- "your-password"`
3. `npm run db:push` to create tables
4. `npm run dev`

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the **Neon** integration from the Vercel Marketplace (sets `DATABASE_URL`).
3. Add `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` in Project Settings → Environment Variables.
4. Run `npm run db:push` once locally against the production `DATABASE_URL`.
5. Deploy.
