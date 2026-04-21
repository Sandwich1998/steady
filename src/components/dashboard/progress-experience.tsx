type ProgressExperienceProps = {
  stats: {
    totalHabits: number;
    buildHabits: number;
    breakHabits: number;
    urgesResisted: number;
    dayCompleted: boolean;
  };
  weeklyHistory: {
    date: string;
    label: string;
    mood: number | null;
    completed: boolean;
    completionsCount: number;
    restCount: number;
    urgesCount: number;
    resistedCount: number;
    actedCount: number;
  }[];
  previousWeekSummary: {
    completions: number;
    brightDays: number;
    calmDays: number;
    moodAverage: number | null;
    urgesResisted: number;
    urgesCount: number;
  };
  habits: {
    name: string;
    stats: {
      totalUrges: number;
      resistedUrges: number;
      actedUrges: number;
    };
  }[];
};

const moodTone = ["Quiet", "Low", "Steady", "Good", "Bright", "Strong"] as const;

function getMoodLabel(mood: number | null) {
  return mood ? moodTone[mood] : "Unmarked";
}

function getMoodShiftLabel(current: number | null, previous: number | null) {
  if (current === null || previous === null) return "No compare yet";
  if (current === previous) return "About the same as last week";
  return current > previous ? "A bit brighter than last week" : "A bit heavier than last week";
}

function getMoodColorClass(mood: number | null) {
  if (mood === null) return "bg-[#f1e1e7]";
  if (mood <= 2) return "bg-[#ffb7bf]";
  if (mood === 3) return "bg-[#ffd68b]";
  if (mood === 4) return "bg-[#8be6dc]";
  return "bg-[#69d7ca]";
}

function getPrimarySignal(totalResisted: number, totalUrges: number, totalCompletions: number) {
  if (totalUrges > 0 && totalResisted > 0) {
    return {
      eyebrow: "Strongest signal",
      line: `${totalResisted} urge interruption${totalResisted === 1 ? "" : "s"}`,
      note: `${totalUrges} urge moment${totalUrges === 1 ? "" : "s"} logged in the last 7 days.`,
    };
  }

  if (totalUrges > 0) {
    return {
      eyebrow: "Next signal to build",
      line: "Delay the next urge",
      note: `${totalUrges} urge moment${totalUrges === 1 ? "" : "s"} logged. One 10-minute delay counts.`,
    };
  }

  if (totalCompletions > 0) {
    return {
      eyebrow: "Strongest signal",
      line: `${totalCompletions} practice return${totalCompletions === 1 ? "" : "s"}`,
      note: "Completions in the last 7 days. Small returns are the point.",
    };
  }

  return {
    eyebrow: "Next signal to build",
    line: "One small return",
    note: "Log one practice or one delayed urge to make this screen useful.",
  };
}

export function ProgressExperience({
  stats,
  weeklyHistory,
  previousWeekSummary,
  habits,
}: ProgressExperienceProps) {
  const totalCompletions = weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
  const totalRestDays = weeklyHistory.reduce((sum, day) => sum + day.restCount, 0);
  const totalResisted = weeklyHistory.reduce((sum, day) => sum + day.resistedCount, 0);
  const totalUrges = weeklyHistory.reduce((sum, day) => sum + day.urgesCount, 0);
  const totalActed = weeklyHistory.reduce((sum, day) => sum + day.actedCount, 0);
  const averageMoodSource = weeklyHistory.filter((day) => day.mood !== null);
  const moodAverage =
    averageMoodSource.length > 0
      ? Math.round(
          averageMoodSource.reduce((sum, day) => sum + (day.mood ?? 0), 0) /
            averageMoodSource.length,
        )
      : null;
  const moodShiftLabel = getMoodShiftLabel(moodAverage, previousWeekSummary.moodAverage);
  const maxCompletions = Math.max(...weeklyHistory.map((day) => day.completionsCount), 1);
  const bestDay = [...weeklyHistory].sort((a, b) => b.completionsCount - a.completionsCount)[0] ?? null;
  const primarySignal = getPrimarySignal(totalResisted, totalUrges, totalCompletions);
  const practiceMixLabel =
    stats.totalHabits > 0
      ? stats.buildHabits > stats.breakHabits
        ? `Your repeat practices carried more of the week.`
        : stats.buildHabits < stats.breakHabits
          ? `The harder patterns need a little more support right now.`
          : `Your repeat and loosen practices both mattered this week.`
      : "No practices set yet.";
  const bestDayCopy =
    bestDay && bestDay.completionsCount > 0
      ? `${bestDay.label} felt strongest. You showed up ${bestDay.completionsCount} time${bestDay.completionsCount === 1 ? "" : "s"}.`
      : "No single day stood out yet, but the week still gave you something to notice.";
  const hardestPattern = [...habits]
    .filter((habit) => habit.stats.totalUrges > 0)
    .sort((a, b) => b.stats.totalUrges - a.stats.totalUrges)[0] ?? null;
  const controlCopy =
    totalUrges > 0
      ? totalActed > 0
        ? `${totalResisted} interruptions and ${totalActed} slip${totalActed === 1 ? "" : "s"}. Keep practicing the quick return.`
        : `${totalResisted} urge interruption${totalResisted === 1 ? "" : "s"} logged. You are building delay.`
      : "No urge moments logged yet. Use the button when the pull shows up.";
  const heroStats = [
    {
      label: "Urges interrupted",
      value: totalUrges > 0 ? `${totalResisted}/${totalUrges}` : "0",
      sublabel: totalUrges > 0 ? "Handled before acting" : "Use support when one hits",
    },
    {
      label: "Practice returns",
      value: totalCompletions,
      sublabel: "Completed in 7 days",
    },
    {
      label: "Mood check-ins",
      value: averageMoodSource.length,
      sublabel: "Days with a mood note",
    },
  ];

  return (
    <div className="grid gap-4">
      <section className="app-hero relative overflow-hidden rounded-[28px] px-5 py-5">
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[rgba(184,166,255,0.1)] blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-20 w-20 rounded-full bg-[rgba(255,201,120,0.12)] blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Last 7 days
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-700">{primarySignal.eyebrow}</div>
              <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.05] tracking-tight text-slate-950">
                {primarySignal.line}
              </h2>
              <p className="mt-3 max-w-[19rem] text-sm leading-6 text-slate-600">{primarySignal.note}</p>
            </div>
            <div className="shrink-0 rounded-full bg-white/72 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Week
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] bg-white/62 px-3 py-3 shadow-[0_12px_28px_-28px_rgba(214,173,183,0.22)]"
              >
                <div className="min-h-8 text-[11px] font-semibold uppercase leading-4 tracking-[0.11em] text-slate-500">
                  {item.label}
                </div>
                <div className="mt-2 text-[1.45rem] font-semibold leading-none text-slate-950">
                  {item.value}
                </div>
                <div className="mt-1.5 text-[11px] leading-4 text-slate-500">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <article className="rounded-[28px] bg-white/70 px-5 py-5 shadow-[0_12px_30px_-28px_rgba(214,173,183,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-700">Mood</div>
              <div className="mt-2 text-[1.35rem] font-semibold leading-tight tracking-tight text-slate-950">
                Mood felt mostly steady
              </div>
              <div className="mt-1.5 text-sm leading-6 text-slate-600">{moodShiftLabel}</div>
            </div>
            <div className="shrink-0 rounded-full bg-[#fff7fb] px-3 py-1.5 text-xs font-semibold text-slate-600">
              {averageMoodSource.length} check-in{averageMoodSource.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Mood check-ins by day">
            {weeklyHistory.map((day) => (
              <div
                key={day.date}
                className={`h-5 rounded-full ${getMoodColorClass(day.mood)} ${
                  day.mood === null
                    ? "opacity-55"
                    : "shadow-[0_12px_24px_-18px_rgba(105,215,202,0.72)]"
                }`}
                title={day.mood === null ? `${day.label}: no mood check-in` : `${day.label}: ${getMoodLabel(day.mood)}`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Heavier</span>
            <span>Steady</span>
            <span>Brighter</span>
          </div>
        </article>

        <article className="rounded-[28px] bg-[#fff8fb] px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold text-slate-950">Urge moments</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{controlCopy}</p>
            </div>
            <div className="shrink-0 rounded-full bg-white/78 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {totalUrges > 0 ? `${totalResisted}/${totalUrges}` : "0"}
            </div>
          </div>
        </article>
      </section>

      <article className="rounded-[30px] bg-white/74 px-5 py-5 shadow-[0_16px_38px_-34px_rgba(214,173,183,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-950">This week, day by day</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">Daily completions at a glance.</div>
          </div>
          <div className="rounded-full bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
            {totalCompletions} this week
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2.5">
          {weeklyHistory.map((day) => {
            const barHeight = `${Math.max((day.completionsCount / maxCompletions) * 100, day.completionsCount > 0 ? 14 : 4)}%`;
            const isBestDay = bestDay?.date === day.date && day.completionsCount > 0;

            return (
              <div key={day.date} className="flex flex-col items-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {day.label.slice(0, 3)}
                </div>
                <div
                  className={`mt-3 flex h-32 w-full items-end justify-center rounded-[22px] px-2 py-3 ${
                    isBestDay ? "bg-[linear-gradient(180deg,#fff7ef_0%,#fff4f7_100%)]" : "bg-[#fff8fb]"
                  }`}
                >
                  <div className="flex h-full w-9 items-end rounded-full bg-[#f6e7ed] p-1">
                    <div
                      className={`w-full rounded-full transition-all ${
                        day.completionsCount > 0
                          ? "bg-[linear-gradient(180deg,#8be6dc_0%,#6cc8f4_100%)]"
                          : "bg-[linear-gradient(180deg,#ffe3b4_0%,#ffd3d8_100%)]"
                      }`}
                      style={{ height: barHeight }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{day.completionsCount}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-2 rounded-[22px] bg-[#fff8fb] px-4 py-3">
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-500">Best day</span>
            <span className="text-right font-medium text-slate-900">
              {bestDay && bestDay.completionsCount > 0
                ? `${bestDay.label} with ${bestDay.completionsCount} completion${bestDay.completionsCount === 1 ? "" : "s"}`
                : "No day stood out yet"}
            </span>
          </div>
          {totalRestDays > 0 ? (
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-slate-500">Rest days</span>
              <span className="text-right font-medium text-slate-900">
                {totalRestDays} planned rest day{totalRestDays === 1 ? "" : "s"} kept
              </span>
            </div>
          ) : null}
        </div>
      </article>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[28px] bg-white/58 px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
          <div className="text-base font-semibold text-slate-950">Best day</div>
          <div className="mt-3 text-sm leading-6 text-slate-600">{bestDayCopy}</div>
        </article>

        <article className="rounded-[28px] bg-white/58 px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
          <div className="text-base font-semibold text-slate-950">What helped</div>
          <div className="mt-3 text-sm leading-6 text-slate-600">
            {practiceMixLabel}
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f6e7ed]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8be6dc_0%,#ffd68b_100%)]"
              style={{
                width: `${stats.totalHabits > 0 ? (stats.buildHabits / stats.totalHabits) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Keep the supportive ones close. Give the harder ones an earlier cue.
          </div>
        </article>
      </section>

      <article className="rounded-[28px] bg-[#fff8fb] px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
        <div className="text-base font-semibold text-slate-950">Pattern pressure</div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {hardestPattern
            ? `${hardestPattern.name} is asking for the most support. Plan the high-risk time before it starts.`
            : "Once you log urge moments, this will show where to add more support."}
        </p>
      </article>
    </div>
  );
}
