import { HabitType, UrgeOutcome } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getTodayKey } from "@/lib/date";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRecentDateKeys(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));

    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export async function getDashboardData() {
  const today = getTodayKey();
  const lastSevenDays = getRecentDateKeys(7);
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - 6);

  const [dayReset, habits, completions, recentUrges, weeklyResets, weeklyCompletions, weeklyUrges] =
    await Promise.all([
    prisma.dayReset.findUnique({
      where: { date: today },
    }),
    prisma.habit.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        completions: {
          orderBy: { completedAt: "desc" },
          select: {
            date: true,
            completedAt: true,
          },
        },
        urgeLogs: {
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
            outcome: true,
            intensity: true,
          },
        },
      },
    }),
    prisma.habitCompletion.findMany({
      where: { date: today },
      select: { habitId: true },
    }),
    prisma.urgeLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        habit: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    }),
    prisma.dayReset.findMany({
      where: {
        date: {
          in: lastSevenDays.map((day) => day.key),
        },
      },
    }),
    prisma.habitCompletion.findMany({
      where: {
        date: {
          in: lastSevenDays.map((day) => day.key),
        },
      },
      select: { date: true },
    }),
    prisma.urgeLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        outcome: true,
      },
    }),
  ]);

  const completedHabitIds = new Set(completions.map((completion) => completion.habitId));
  const dayCompleted = habits.length > 0 && habits.every((habit) => completedHabitIds.has(habit.id));
  const resetMap = new Map(weeklyResets.map((reset) => [reset.date, reset.mood]));
  const completionCounts = weeklyCompletions.reduce<Map<string, number>>((map, completion) => {
    map.set(completion.date, (map.get(completion.date) ?? 0) + 1);
    return map;
  }, new Map());
  const urgeCounts = weeklyUrges.reduce<
    Map<string, { total: number; resisted: number; acted: number }>
  >((map, urge) => {
    const dateKey = formatDateKey(urge.createdAt);
    const entry = map.get(dateKey) ?? { total: 0, resisted: 0, acted: 0 };
    entry.total += 1;
    if (urge.outcome === UrgeOutcome.RESISTED) {
      entry.resisted += 1;
    } else {
      entry.acted += 1;
    }
    map.set(dateKey, entry);
    return map;
  }, new Map());

  return {
    today,
    dayReset: dayReset
      ? {
          mood: dayReset.mood,
          startedAt: dayReset.startedAt.toISOString(),
          startedAtLabel: timeFormatter.format(dayReset.startedAt),
        }
      : null,
    stats: {
      totalHabits: habits.length,
      buildHabits: habits.filter((habit) => habit.type === HabitType.BUILD).length,
      breakHabits: habits.filter((habit) => habit.type === HabitType.BREAK).length,
      urgesResisted: recentUrges.filter((urge) => urge.outcome === UrgeOutcome.RESISTED).length,
      dayCompleted,
    },
    habits: habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      type: habit.type,
      minimumAction: habit.minimumAction,
      completedToday: completedHabitIds.has(habit.id),
      stats: {
        totalCompletions: habit.completions.length,
        completionsLast7Days: habit.completions.filter((completion) =>
          lastSevenDays.some((day) => day.key === completion.date),
        ).length,
        lastCompletedAt: habit.completions[0]?.completedAt.toISOString() ?? null,
        lastCompletedAtLabel: habit.completions[0]
          ? dateTimeFormatter.format(habit.completions[0].completedAt)
          : null,
        totalUrges: habit.urgeLogs.length,
        resistedUrges: habit.urgeLogs.filter((urge) => urge.outcome === UrgeOutcome.RESISTED)
          .length,
        actedUrges: habit.urgeLogs.filter((urge) => urge.outcome === UrgeOutcome.ACTED).length,
        averageUrgeIntensity:
          habit.urgeLogs.length > 0
            ? Number(
                (
                  habit.urgeLogs.reduce((sum, urge) => sum + urge.intensity, 0) /
                  habit.urgeLogs.length
                ).toFixed(1),
              )
            : null,
      },
    })),
    recentUrges: recentUrges.map((urge) => ({
      id: urge.id,
      habitName: urge.habit.name,
      habitType: urge.habit.type,
      intensity: urge.intensity,
      outcome: urge.outcome,
      createdAt: urge.createdAt.toISOString(),
      createdAtLabel: timeFormatter.format(urge.createdAt),
    })),
    weeklyHistory: lastSevenDays.map((day) => {
      const urgeSummary = urgeCounts.get(day.key) ?? { total: 0, resisted: 0, acted: 0 };
      const completionsCount = completionCounts.get(day.key) ?? 0;

      return {
        date: day.key,
        label: day.label,
        mood: resetMap.get(day.key) ?? null,
        completed: completionsCount > 0,
        completionsCount,
        urgesCount: urgeSummary.total,
        resistedCount: urgeSummary.resisted,
        actedCount: urgeSummary.acted,
      };
    }),
  };
}
