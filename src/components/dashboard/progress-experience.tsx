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

const moodTone = ["Quiet", "Very low", "Low", "Okay", "Good", "Great"] as const;

function getMoodLabel(mood: number | null) {
  return mood ? moodTone[mood] : "Unmarked";
}

function getMoodShiftLabel(current: number | null, previous: number | null) {
  if (current === null || previous === null) return "No compare yet";
  if (current === previous) return "About the same as last week";
  return current > previous ? "A bit brighter than last week" : "A bit heavier than last week";
}

function getMoodColorClass(mood: number | null) {
  if (mood === null) return "bg-white/10";
  if (mood === 1) return "bg-[#ff4d6d]";
  if (mood === 2) return "bg-[#ff8a3d]";
  if (mood === 3) return "bg-[#ffd166]";
  if (mood === 4) return "bg-[#7ee081]";
  return "bg-[#2dd4bf]";
}

function getMoodTrendPath(weeklyHistory: ProgressExperienceProps["weeklyHistory"]) {
  const values = weeklyHistory
    .filter((day) => day.mood !== null)
    .map((day) => day.mood as number);
  const width = 320;
  const height = 72;
  const paddingX = 6;
  const paddingY = 8;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = values.map((value, index) => {
      const x =
        paddingX + (usableWidth * index) / Math.max(values.length - 1, 1);
      const y = paddingY + ((5 - value) / 4) * usableHeight;
      return { x, y };
    });

  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;

    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
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
        ? "Your repeat practices carried more of the week."
        : stats.buildHabits < stats.breakHabits
          ? "The harder patterns need a little more support right now."
          : "Your repeat and loosen practices both mattered this week."
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
      : "No urge moments logged yet. Use support when the pull shows up.";
  const heroStats = [
    {
      label: "Urges interrupted",
      value: totalUrges > 0 ? `${totalResisted}/${totalUrges}` : "0",
      sublabel: totalUrges > 0 ? "Handled before acting" : "No urge data yet",
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
    <div className="grid gap-0">
      <section className="px-1 py-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Last 7 days
            </div>
            <div className="mt-3 text-sm font-semibold text-zinc-300">{primarySignal.eyebrow}</div>
            <h2 className="mt-2 text-[1.8rem] font-semibold leading-[1.02] tracking-tight text-zinc-50">
              {primarySignal.line}
            </h2>
            <p className="mt-3 max-w-[20rem] text-sm leading-6 text-zinc-400">{primarySignal.note}</p>
          </div>
          <div className="shrink-0 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Week
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/6 pt-4">
          {heroStats.map((item) => (
            <div key={item.label} className="min-w-0 px-1">
              <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.11em] text-zinc-500">
                {item.label}
              </div>
              <div className="mt-2 text-[1.5rem] font-semibold leading-none text-zinc-50">
                {item.value}
              </div>
              <div className="mt-1.5 text-[11px] leading-4 text-zinc-500">{item.sublabel}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/6 px-1 pt-5">
        <div className="flex items-start justify-between gap-3 px-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Weekly activity
            </div>
            <div className="mt-2 text-[1.25rem] font-semibold tracking-tight text-zinc-50">
              This week, day by day
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-400">Daily completions at a glance.</div>
          </div>
          <div className="pt-0.5 text-sm font-medium text-zinc-400">{totalCompletions} total</div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 px-4">
          {weeklyHistory.map((day) => {
            const barHeight = `${Math.max((day.completionsCount / maxCompletions) * 100, day.completionsCount > 0 ? 14 : 4)}%`;
            const isBestDay = bestDay?.date === day.date && day.completionsCount > 0;

            return (
              <div key={day.date} className="flex flex-col items-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {day.label.slice(0, 3)}
                </div>
                <div
                  className={`mt-3 flex h-32 w-full items-end justify-center rounded-[14px] px-2 py-3 ${
                    isBestDay
                      ? "bg-[linear-gradient(180deg,rgba(254,44,85,0.12)_0%,rgba(37,244,238,0.07)_100%)]"
                      : "bg-white/[0.03]"
                  }`}
                >
                  <div className="flex h-full w-9 items-end rounded-full bg-white/6 p-1">
                    <div
                      className={`w-full rounded-full transition-all ${
                        day.completionsCount > 0
                          ? "bg-[linear-gradient(180deg,#25f4ee_0%,#fe2c55_100%)]"
                          : "bg-white/10"
                      }`}
                      style={{ height: barHeight }}
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold text-zinc-100">{day.completionsCount}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-2 px-4 py-2">
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-zinc-500">Best day</span>
            <span className="text-right font-medium text-zinc-100">
              {bestDay && bestDay.completionsCount > 0
                ? `${bestDay.label} with ${bestDay.completionsCount} completion${bestDay.completionsCount === 1 ? "" : "s"}`
                : "No day stood out yet"}
            </span>
          </div>
          {totalRestDays > 0 ? (
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-zinc-500">Rest days</span>
              <span className="text-right font-medium text-zinc-100">
                {totalRestDays} planned rest day{totalRestDays === 1 ? "" : "s"} kept
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-t border-white/6 px-1 pt-5">
        <div className="grid gap-5 px-4">
          <article>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Mood
                </div>
                <div className="mt-2 text-[1.2rem] font-semibold tracking-tight text-zinc-50">
                  Mood felt mostly steady
                </div>
                <div className="mt-1.5 text-sm leading-6 text-zinc-400">{moodShiftLabel}</div>
              </div>
              <div className="shrink-0 text-xs font-semibold text-zinc-500">
                {averageMoodSource.length} check-in{averageMoodSource.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Mood check-ins by day">
              {weeklyHistory.map((day) => (
                <div
                  key={day.date}
                  className={`h-5 rounded-full ${getMoodColorClass(day.mood)} ${day.mood === null ? "opacity-55" : ""}`}
                  title={day.mood === null ? `${day.label}: no mood check-in` : `${day.label}: ${getMoodLabel(day.mood)}`}
                />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>Heavier</span>
              <span>Steady</span>
              <span>Brighter</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[18px] bg-white/[0.03] px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Mood trend
                </div>
                <div className="text-[11px] text-zinc-500">
                  {averageMoodSource.length > 0
                    ? `${averageMoodSource.length} actual check-in${averageMoodSource.length === 1 ? "" : "s"}`
                    : "No check-ins yet"}
                </div>
              </div>
              <svg
                viewBox="0 0 320 72"
                className="h-[72px] w-full"
                aria-label="Mood trend over the last 7 days"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="moodTrendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff4d6d" />
                    <stop offset="25%" stopColor="#ff8a3d" />
                    <stop offset="50%" stopColor="#ffd166" />
                    <stop offset="75%" stopColor="#7ee081" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
                {[1, 2, 3, 4, 5].map((level) => {
                  const y = 8 + ((5 - level) / 4) * (72 - 16);
                  return (
                    <line
                      key={level}
                      x1="0"
                      y1={y}
                      x2="320"
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray={level === 3 ? "4 4" : undefined}
                    />
                  );
                })}
                <path
                  d={getMoodTrendPath(weeklyHistory)}
                  fill="none"
                  stroke="url(#moodTrendStroke)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </article>

          <article className="border-t border-white/6 pt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Pressure
            </div>
            <div className="mt-2 text-[1.2rem] font-semibold tracking-tight text-zinc-50">
              Urge moments
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{controlCopy}</p>
            <div className="mt-4 text-sm font-semibold text-zinc-300">
              {totalUrges > 0 ? `${totalResisted}/${totalUrges} handled before acting` : "No urge data yet"}
            </div>
            <div className="mt-5 border-t border-white/6 pt-4">
              <div className="text-sm font-semibold text-zinc-50">Pattern pressure</div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {hardestPattern
                  ? `${hardestPattern.name} is asking for the most support. Plan the high-risk time before it starts.`
                  : "Once you log urge moments, this will show where to add more support."}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-white/6 px-1 pt-5">
        <div className="grid gap-5 px-4 sm:grid-cols-2">
          <article>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Read
            </div>
            <div className="mt-2 text-[1.2rem] font-semibold text-zinc-50">Best day</div>
            <div className="mt-3 text-sm leading-6 text-zinc-400">{bestDayCopy}</div>
          </article>

          <article>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Mix
            </div>
            <div className="mt-2 text-[1.2rem] font-semibold text-zinc-50">What helped</div>
            <div className="mt-3 text-sm leading-6 text-zinc-400">{practiceMixLabel}</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#25f4ee_0%,#fe2c55_100%)]"
                style={{
                  width: `${stats.totalHabits > 0 ? (stats.buildHabits / stats.totalHabits) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="mt-3 text-sm text-zinc-400">
              Keep the supportive ones close. Give the harder ones an earlier cue.
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
