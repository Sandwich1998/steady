# Steady

Simple habit companion built with Next.js, Tailwind CSS, Prisma, and Postgres.

## Core loop

- Start the day with a mood-based daily reset
- Create build and break habits
- Mark a minimum action as done
- Log urges against break habits
- Show whether the day is completed based on at least one minimum action

## Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- Postgres

## Run locally

1. Add a database URL:

```bash
cp .env.example .env
```

Use a hosted Postgres database such as Neon or Supabase.

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

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`

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
- `src/app/api/*`: route handlers for reset, habits, completions, and urges
- `src/components/dashboard/*`: reusable UI blocks
- `src/lib/*`: Prisma client, date helpers, validation, dashboard loader
- `prisma/seed.js`: deterministic sample data seeding
