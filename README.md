# Steady

Simple habit companion built with Next.js, Tailwind CSS, Prisma, and Postgres.

## Core loop

- Start the day with a mood-based daily reset
- Create build and break habits
- Mark a minimum action as done
- Log urges against break habits
- Show whether the day is completed based on at least one minimum action
- Require account login so each dashboard is private to the signed-in user

## Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- Postgres
- Custom cookie sessions with email verification and optional Google OAuth

## Run locally

1. Add environment variables:

```bash
cp .env.example .env
```

Use a hosted Postgres database such as Neon or Supabase.
Set `APP_TIME_ZONE` to the timezone you want daily check-ins and weekly history to follow.
Set `APP_URL` to your local or deployed app URL.

Email signup stores a pending registration and creates the account only after the verification link
is opened. Password recovery uses the same email delivery settings.
Local development can use returned dev verification and reset links with
`AUTH_ALLOW_DEV_VERIFY_LINK=true`.
Google sign-in needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; the redirect URI is:

```text
{APP_URL}/api/auth/google/callback
```

2. Install dependencies:

```bash
npm install
```

3. Push the schema:

```bash
npm run db:push
```

4. Seed the app with sample data:

```bash
npm run db:seed
```

The seed creates a verified demo account:

```text
demo@steady.local / steady-demo-123
```

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000` and log in.

## Smoke test

After the app is running and seeded:

```bash
npm run test:smoke
```

This runs a small mobile smoke check through Today, Progress, and Manage using Playwright.

## Deploy to Vercel

1. Create a hosted Postgres database.
2. In Vercel, add `DATABASE_URL` in your project environment variables.
3. Redeploy.

Recommended providers:

- Neon
- Supabase

This app is configured for Postgres. Do not use a local SQLite file on Vercel.

## Main files

- `prisma/schema.prisma`: database schema
- `src/app/page.tsx`: main dashboard
- `src/app/api/*`: route handlers for auth, reset, habits, completions, and urges
- `src/components/dashboard/*`: reusable UI blocks
- `src/lib/*`: Prisma client, date helpers, validation, dashboard loader
- `prisma/seed.js`: deterministic sample data seeding
