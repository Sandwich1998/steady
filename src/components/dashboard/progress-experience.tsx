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
};

const moodTone = ["Quiet", "Low", "Steady", "Good", "Bright", "Strong"] as const;

function getMoodLabel(mood: number | null) {
  return mood ? moodTone[mood] : "Unmarked";
}

function getSparklinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  if (values.length === 1) return `M 0 ${height / 2} L ${width} ${height / 2}`;

  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

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

function getWeekHeadline(brightDays: number, calmDays: number, moodAverage: number | null) {
  if (brightDays >= 5 && calmDays >= 4) return "You gave this week something to build on";
  if (brightDays >= 4) return "You kept coming back this week";
  if (moodAverage !== null && moodAverage >= 4) return "This week felt a little lighter";
  if (brightDays >= 2) return "You kept showing up this week";
  return "This week was a reset week";
}

function getWeekSupportCopy(
  brightDays: number,
  calmDays: number,
  totalCompletions: number,
  moodAverage: number | null,
) {
  if (brightDays >= 5 && calmDays >= 4) {
    return "You kept coming back, and most days had something solid to build on.";
  }

  if (brightDays >= 4) {
    return "You kept showing up, even when the week was not perfectly even.";
  }

  if (moodAverage !== null && moodAverage >= 4) {
    return "There was still some lightness in the week, even if it felt mixed.";
  }

  if (totalCompletions > 0) {
    return "You still came back to yourself this week, one small step at a time.";
  }

  return "A quieter week still counts. You can begin again from here.";
}

function getDeltaLabel(current: number, previous: number) {
  const delta = current - previous;
  if (delta === 0) return "Same as last week";
  if (delta > 0) return `${delta} more than last week`;
  return `${Math.abs(delta)} less than last week`;
}

function getMoodShiftLabel(current: number | null, previous: number | null) {
  if (current === null || previous === null) return "No compare yet";
  if (current === previous) return "Same feel";
  return current > previous ? "A little lighter" : "A little heavier";
}

export function ProgressExperience({
  stats,
  weeklyHistory,
  previousWeekSummary,
}: ProgressExperienceProps) {
  const brightDays = weeklyHistory.filter((day) => day.completed).length;
  const calmDays = weeklyHistory.filter(isSteadierDay).length;
  const totalCompletions = weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
  const totalRestDays = weeklyHistory.reduce((sum, day) => sum + day.restCount, 0);
  const totalResisted = weeklyHistory.reduce((sum, day) => sum + day.resistedCount, 0);
  const totalUrges = weeklyHistory.reduce((sum, day) => sum + day.urgesCount, 0);
  const averageMoodSource = weeklyHistory.filter((day) => day.mood !== null);
  const moodAverage =
    averageMoodSource.length > 0
      ? Math.round(
          averageMoodSource.reduce((sum, day) => sum + (day.mood ?? 0), 0) /
            averageMoodSource.length,
        )
      : null;
  const maxCompletions = Math.max(...weeklyHistory.map((day) => day.completionsCount), 1);
  const bestDay = [...weeklyHistory].sort((a, b) => b.completionsCount - a.completionsCount)[0] ?? null;
  const headline = getWeekHeadline(brightDays, calmDays, moodAverage);
  const supportCopy = getWeekSupportCopy(brightDays, calmDays, totalCompletions, moodAverage);
  const practiceMixLabel =
    stats.totalHabits > 0
      ? stats.buildHabits > stats.breakHabits
        ? `Your repeat practices carried more of the week.`
        : stats.buildHabits < stats.breakHabits
          ? `The harder patterns need a little more support right now.`
          : `Your repeat and loosen practices both mattered this week.`
      : "No practices set yet.";
  const sparklinePath = getSparklinePath(
    weeklyHistory.map((day) => day.completionsCount),
    160,
    44,
  );
  const calmRingRadius = 34;
  const calmRingCircumference = 2 * Math.PI * calmRingRadius;
  const calmRingOffset = calmRingCircumference - (calmDays / 7) * calmRingCircumference;
  const bestDayCopy =
    bestDay && bestDay.completionsCount > 0
      ? `${bestDay.label} felt strongest. You showed up ${bestDay.completionsCount} time${bestDay.completionsCount === 1 ? "" : "s"}.`
      : "No single day stood out yet, but the week still gave you something to notice.";
  const urgeSummaryCopy =
    totalUrges > 0
      ? `You got through ${totalResisted} of ${totalUrges} urge moments this week.`
      : "No urge moments were logged this week.";
  const comparisonItems = [
    {
      label: "Steadier days",
      value: calmDays,
      sublabel: getDeltaLabel(calmDays, previousWeekSummary.calmDays),
    },
    {
      label: "Showed up",
      value: totalCompletions,
      sublabel: getDeltaLabel(totalCompletions, previousWeekSummary.completions),
    },
    {
      label: "Mood",
      value: moodAverage ? getMoodLabel(moodAverage) : "Unmarked",
      sublabel: getMoodShiftLabel(moodAverage, previousWeekSummary.moodAverage),
    },
  ];

  return (
    <div className="grid gap-4">
      <section className="app-hero relative overflow-hidden rounded-[32px] px-5 py-6">
        <div className="pointer-events-none absolute -right-14 top-0 h-32 w-32 rounded-full bg-[rgba(184,166,255,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[rgba(255,201,120,0.16)] blur-3xl" />

        <div className="relative">
          <div className="text-sm font-semibold text-slate-700">Your week at a glance</div>
          <h2 className="mt-3 max-w-[15rem] text-[2.1rem] font-semibold leading-[0.98] tracking-tight text-slate-950">
            {headline}
          </h2>
          <p className="mt-4 max-w-[18rem] text-sm leading-6 text-slate-600">{supportCopy}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {comparisonItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] bg-white/56 px-3 py-3 shadow-[0_12px_28px_-28px_rgba(214,173,183,0.22)]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </div>
                <div className="mt-2 text-lg font-semibold leading-none text-slate-950">
                  {item.value}
                </div>
                <div className="mt-2 text-[11px] leading-4 text-slate-500">{item.sublabel}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <article className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(255,244,249,0.92)_100%)] px-5 py-5 shadow-[0_28px_60px_-36px_rgba(214,173,183,0.34)]">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <div className="relative h-[6.75rem] w-[6.75rem] shrink-0">
                  <svg viewBox="0 0 92 92" className="-rotate-90">
                    <circle
                      cx="46"
                      cy="46"
                      r={calmRingRadius}
                      stroke="rgba(233,217,224,0.92)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="46"
                      cy="46"
                      r={calmRingRadius}
                      stroke="url(#steadyWeekRing)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={calmRingCircumference}
                      strokeDashoffset={calmRingOffset}
                    />
                    <defs>
                      <linearGradient id="steadyWeekRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#69d7ca" />
                        <stop offset="100%" stopColor="#ffc978" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[1.8rem] font-semibold leading-none text-slate-950">
                      {calmDays}
                    </div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                      steady
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-700">Days that felt steadier</div>
                  <div className="mt-2 text-[1.95rem] font-semibold leading-[1.02] tracking-tight text-slate-950">
                    {calmDays} day{calmDays === 1 ? "" : "s"} felt steadier.
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">
                    Days when things felt a little more manageable.
                  </div>
                </div>
              </div>
            </article>

            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_14px_34px_-30px_rgba(214,173,183,0.16)]">
                <div className="text-sm font-semibold text-slate-700">Times you showed up</div>
                <div className="mt-2 text-[1.9rem] font-semibold leading-none text-slate-950">
                  {totalCompletions}
                </div>
                <svg viewBox="0 0 160 44" className="mt-4 h-11 w-full">
                  <path
                    d={sparklinePath}
                    fill="none"
                    stroke="#ff5ea8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-2 text-xs text-slate-500">
                  How many times you came back to a practice this week.
                </div>
              </article>

              <article className="rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_14px_34px_-30px_rgba(214,173,183,0.16)]">
                <div className="text-sm font-semibold text-slate-700">Mood</div>
                <div className="mt-2 text-[1.25rem] font-semibold leading-tight text-slate-950">
                  {moodAverage ? `Mood stayed ${getMoodLabel(moodAverage).toLowerCase()}.` : "No mood read yet."}
                </div>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`h-3.5 flex-1 rounded-full ${
                        moodAverage !== null && value <= moodAverage
                          ? value <= 2
                            ? "bg-[#ffb7bf]"
                            : value === 3
                              ? "bg-[#ffd68b]"
                              : "bg-[#69d7ca]"
                          : "bg-[#f3e5ea]"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {moodAverage ? "Based on the mood you checked in with this week." : "Check in to see your weekly mood read."}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <article className="rounded-[30px] bg-white/74 px-5 py-5 shadow-[0_16px_38px_-34px_rgba(214,173,183,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-950">This week, day by day</div>
            <div className="mt-3 text-xs leading-5 text-slate-500">
              Taller bars mean more completions.
            </div>
          </div>
          <div className="rounded-full bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
            {totalCompletions} this week
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {weeklyHistory.map((day) => {
            const barHeight = `${Math.max((day.completionsCount / maxCompletions) * 100, day.completionsCount > 0 ? 16 : 6)}%`;
            const moodColor =
              day.mood === null
                ? "bg-[#f0dfe5]"
                : day.mood <= 2
                  ? "bg-[#ffb7bf]"
                  : day.mood === 3
                    ? "bg-[#ffd68b]"
                    : "bg-[#69d7ca]";

            return (
              <div key={day.date} className="flex flex-col items-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {day.label.slice(0, 3)}
                </div>
                <div className="mt-3 flex h-32 w-full items-end justify-center rounded-[22px] bg-[#fff8fb] px-2 py-3">
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
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${moodColor}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-[22px] bg-[#fff8fb] px-4 py-3 text-sm text-slate-600">
          {urgeSummaryCopy}
          {totalRestDays > 0 ? ` You also kept ${totalRestDays} planned rest day${totalRestDays === 1 ? "" : "s"}.` : ""}
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
    </div>
  );
}
