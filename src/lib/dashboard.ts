import { HabitType, UrgeOutcome } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  APP_TIME_ZONE,
  formatDateKey,
  getDateDaysAgo,
  getRecentDateKeys,
  getTodayKey,
} from "@/lib/date";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

function isSteadierDay(day: {
  mood: number | null;
  completed: boolean;
  urgesCount: number;
  resistedCount: number;
  actedCount: number;
}) {
  if (day.urgesCount > 0) {
    return day.resistedCount > day.actedCount;
  }

  if (day.mood !== null) {
    return day.mood >= 3 && day.completed;
  }

  return day.completed;
}

export async function getDashboardData() {
  const today = getTodayKey();
  const lastSevenDays = getRecentDateKeys(7);
  const previousSevenDays = getRecentDateKeys(7, 7);
  const startDate = getDateDaysAgo(6);
  const previousStartDate = getDateDaysAgo(13);
  const previousEndDate = new Date(getDateDaysAgo(7));
  previousEndDate.setUTCHours(23, 59, 59, 999);
  const prismaWithRestDays = prisma as typeof prisma & {
    habitRestDay?: {
      findMany: (args: {
        where:
          | { date: string }
          | {
              date: {
                in: string[];
              };
            };
        select: { habitId?: true; date?: true };
      }) => Promise<{ habitId?: string; date?: string }[]>;
    };
  };

  const [
    dayReset,
    habits,
    completions,
    restDays,
    recentUrges,
    weeklyResets,
    weeklyCompletions,
    weeklyRestDays,
    weeklyUrges,
    previousWeekResets,
    previousWeekCompletions,
    previousWeekUrges,
    completionTotals,
    completionLastSevenDays,
    lastCompletionMoments,
    urgeOutcomeTotals,
    urgeIntensityTotals,
  ] =
    await Promise.all([
    prisma.dayReset.findUnique({
      where: { date: today },
    }),
    prisma.habit.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        type: true,
        minimumAction: true,
      },
    }),
    prisma.habitCompletion.findMany({
      where: { date: today },
      select: { habitId: true },
    }),
    prismaWithRestDays.habitRestDay?.findMany({
      where: { date: today },
      select: { habitId: true },
    }) ?? Promise.resolve([]),
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
    prismaWithRestDays.habitRestDay?.findMany({
      where: {
        date: {
          in: lastSevenDays.map((day) => day.key),
        },
      },
      select: { date: true },
    }) ?? Promise.resolve([]),
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
    prisma.dayReset.findMany({
      where: {
        date: {
          in: previousSevenDays.map((day) => day.key),
        },
      },
    }),
    prisma.habitCompletion.findMany({
      where: {
        date: {
          in: previousSevenDays.map((day) => day.key),
        },
      },
      select: { date: true },
    }),
    prisma.urgeLog.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      select: {
        createdAt: true,
        outcome: true,
      },
    }),
    prisma.habitCompletion.groupBy({
      by: ["habitId"],
      _count: { _all: true },
    }),
    prisma.habitCompletion.groupBy({
      by: ["habitId"],
      where: {
        date: {
          in: lastSevenDays.map((day) => day.key),
        },
      },
      _count: { _all: true },
    }),
    prisma.habitCompletion.groupBy({
      by: ["habitId"],
      _max: { completedAt: true },
    }),
    prisma.urgeLog.groupBy({
      by: ["habitId", "outcome"],
      _count: { _all: true },
    }),
    prisma.urgeLog.groupBy({
      by: ["habitId"],
      _count: { _all: true },
      _avg: { intensity: true },
    }),
  ]);

  const completedHabitIds = new Set(completions.map((completion) => completion.habitId));
  const restedHabitIds = new Set(restDays.map((restDay) => restDay.habitId));
  const dayCompleted =
    habits.length > 0 &&
    habits.every(
      (habit) => completedHabitIds.has(habit.id) || restedHabitIds.has(habit.id),
    );
  const resetMap = new Map(weeklyResets.map((reset) => [reset.date, reset.mood]));
  const completionCounts = weeklyCompletions.reduce<Map<string, number>>((map, completion) => {
    map.set(completion.date, (map.get(completion.date) ?? 0) + 1);
    return map;
  }, new Map());
  const weeklyRestCounts = weeklyRestDays.reduce<Map<string, number>>((map, restDay) => {
    if (!restDay.date) return map;
    map.set(restDay.date, (map.get(restDay.date) ?? 0) + 1);
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
  const previousResetMap = new Map(previousWeekResets.map((reset) => [reset.date, reset.mood]));
  const previousCompletionCounts = previousWeekCompletions.reduce<Map<string, number>>(
    (map, completion) => {
      map.set(completion.date, (map.get(completion.date) ?? 0) + 1);
      return map;
    },
    new Map(),
  );
  const previousUrgeCounts = previousWeekUrges.reduce<
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
  const previousWeekHistory = previousSevenDays.map((day) => {
    const urgeSummary = previousUrgeCounts.get(day.key) ?? { total: 0, resisted: 0, acted: 0 };
    const completionsCount = previousCompletionCounts.get(day.key) ?? 0;

    return {
      date: day.key,
      mood: previousResetMap.get(day.key) ?? null,
      completed: completionsCount > 0,
      completionsCount,
      urgesCount: urgeSummary.total,
      resistedCount: urgeSummary.resisted,
      actedCount: urgeSummary.acted,
    };
  });
  const previousMoodSource = previousWeekHistory.filter((day) => day.mood !== null);
  const completionTotalMap = new Map(
    completionTotals.map((entry) => [entry.habitId, entry._count._all]),
  );
  const completionLastSevenMap = new Map(
    completionLastSevenDays.map((entry) => [entry.habitId, entry._count._all]),
  );
  const lastCompletionMap = new Map(
    lastCompletionMoments.map((entry) => [entry.habitId, entry._max.completedAt]),
  );
  const urgeTotalsMap = new Map(
    urgeIntensityTotals.map((entry) => [
      entry.habitId,
      {
        total: entry._count._all,
        averageIntensity:
          entry._avg.intensity !== null ? Number(entry._avg.intensity.toFixed(1)) : null,
      },
    ]),
  );
  const resistedUrgeMap = new Map<string, number>();
  const actedUrgeMap = new Map<string, number>();

  for (const entry of urgeOutcomeTotals) {
    if (entry.outcome === UrgeOutcome.RESISTED) {
      resistedUrgeMap.set(entry.habitId, entry._count._all);
      continue;
    }

    actedUrgeMap.set(entry.habitId, entry._count._all);
  }

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
      restedToday: restedHabitIds.has(habit.id),
      stats: {
        totalCompletions: completionTotalMap.get(habit.id) ?? 0,
        completionsLast7Days: completionLastSevenMap.get(habit.id) ?? 0,
        lastCompletedAt: lastCompletionMap.get(habit.id)?.toISOString() ?? null,
        lastCompletedAtLabel: lastCompletionMap.get(habit.id)
          ? dateTimeFormatter.format(lastCompletionMap.get(habit.id) as Date)
          : null,
        totalUrges: urgeTotalsMap.get(habit.id)?.total ?? 0,
        resistedUrges: resistedUrgeMap.get(habit.id) ?? 0,
        actedUrges: actedUrgeMap.get(habit.id) ?? 0,
        averageUrgeIntensity: urgeTotalsMap.get(habit.id)?.averageIntensity ?? null,
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
      const restCount = weeklyRestCounts.get(day.key) ?? 0;

      return {
        date: day.key,
        label: day.label,
        mood: resetMap.get(day.key) ?? null,
        completed: completionsCount > 0,
        completionsCount,
        restCount,
        urgesCount: urgeSummary.total,
        resistedCount: urgeSummary.resisted,
        actedCount: urgeSummary.acted,
      };
    }),
    previousWeekSummary: {
      completions: previousWeekHistory.reduce((sum, day) => sum + day.completionsCount, 0),
      brightDays: previousWeekHistory.filter((day) => day.completed).length,
      calmDays: previousWeekHistory.filter(isSteadierDay).length,
      moodAverage:
        previousMoodSource.length > 0
          ? Math.round(
              previousMoodSource.reduce((sum, day) => sum + (day.mood ?? 0), 0) /
                previousMoodSource.length,
            )
          : null,
      urgesResisted: previousWeekHistory.reduce((sum, day) => sum + day.resistedCount, 0),
      urgesCount: previousWeekHistory.reduce((sum, day) => sum + day.urgesCount, 0),
    },
  };
}
