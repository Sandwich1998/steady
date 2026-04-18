/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, HabitType, UrgeOutcome } = require("@prisma/client");

const prisma = new PrismaClient();

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function daysAgo(count) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - count);
  return date;
}

function atHour(date, hour) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

async function findOrCreateHabit({ name, type, minimumAction }) {
  const existing = await prisma.habit.findFirst({
    where: { name },
  });

  if (existing) {
    return prisma.habit.update({
      where: { id: existing.id },
      data: { type, minimumAction },
    });
  }

  return prisma.habit.create({
    data: { name, type, minimumAction },
  });
}

async function upsertCompletion(habitId, dateKey, completedAt) {
  return prisma.habitCompletion.upsert({
    where: {
      habitId_date: {
        habitId,
        date: dateKey,
      },
    },
    update: { completedAt },
    create: {
      habitId,
      date: dateKey,
      completedAt,
    },
  });
}

async function upsertDayReset(dateKey, mood, startedAt) {
  return prisma.dayReset.upsert({
    where: { date: dateKey },
    update: { mood, startedAt },
    create: {
      date: dateKey,
      mood,
      startedAt,
    },
  });
}

async function ensureUrge({ habitId, createdAt, intensity, outcome }) {
  const existing = await prisma.urgeLog.findFirst({
    where: {
      habitId,
      createdAt,
      intensity,
      outcome,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.urgeLog.create({
    data: {
      habitId,
      createdAt,
      intensity,
      outcome,
    },
  });
}

async function main() {
  const read = await findOrCreateHabit({
    name: "Read 10 pages",
    type: HabitType.BUILD,
    minimumAction: "Read one page before noon",
  });

  const walk = await findOrCreateHabit({
    name: "Morning walk",
    type: HabitType.BUILD,
    minimumAction: "Put on shoes and walk for 5 minutes",
  });

  const doomscroll = await findOrCreateHabit({
    name: "Late-night doomscrolling",
    type: HabitType.BREAK,
    minimumAction: "Put the phone down for 60 seconds",
  });

  const sugar = await findOrCreateHabit({
    name: "Stress snacking",
    type: HabitType.BREAK,
    minimumAction: "Drink water before deciding",
  });

  const moods = [4, 3, 5, 2, 4, 3, 5];

  for (let index = 0; index < 7; index += 1) {
    const day = daysAgo(6 - index);
    const dateKey = formatDateKey(day);

    await upsertDayReset(dateKey, moods[index], atHour(day, 8));

    if (index !== 1) {
      await upsertCompletion(read.id, dateKey, atHour(day, 9));
    }

    if (index === 0 || index === 2 || index === 4 || index === 6) {
      await upsertCompletion(walk.id, dateKey, atHour(day, 7));
    }

    await ensureUrge({
      habitId: doomscroll.id,
      createdAt: atHour(day, 21),
      intensity: ((index + 2) % 5) + 1,
      outcome: index % 3 === 0 ? UrgeOutcome.ACTED : UrgeOutcome.RESISTED,
    });

    if (index % 2 === 0) {
      await ensureUrge({
        habitId: sugar.id,
        createdAt: atHour(day, 15),
        intensity: ((index + 1) % 5) + 1,
        outcome: index % 4 === 0 ? UrgeOutcome.RESISTED : UrgeOutcome.ACTED,
      });
    }
  }

  console.log("Seeded habit MVP data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
