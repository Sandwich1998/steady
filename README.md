# Habit Reset MVP

Simple MVP habit system built with Next.js, Tailwind CSS, Prisma, and SQLite.

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
- SQLite

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create the database and generate the Prisma client:

```bash
npm run db:push
```

3. Seed the app with sample data:

```bash
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Main files

- `prisma/schema.prisma`: database schema
- `src/app/page.tsx`: main dashboard
- `src/app/api/*`: route handlers for reset, habits, completions, and urges
- `src/components/dashboard/*`: reusable UI blocks
- `src/lib/*`: Prisma client, date helpers, validation, dashboard loader
- `prisma/seed.js`: deterministic sample data seeding
