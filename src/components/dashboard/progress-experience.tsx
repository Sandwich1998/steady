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
    urgesCount: number;
    resistedCount: number;
    actedCount: number;
  }[];
};

const moodTone = ["Quiet", "Low", "Steady", "Good", "Bright", "Strong"];

function getProgress(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(value / total, 1);
}

export function ProgressExperience({ stats, weeklyHistory }: ProgressExperienceProps) {
  const brightDays = weeklyHistory.filter((day) => day.completed).length;
  const calmDays = weeklyHistory.filter((day) => day.resistedCount >= day.actedCount).length;
  const bestDay = [...weeklyHistory].sort((a, b) => b.completionsCount - a.completionsCount)[0] ?? null;
  const totalCompletions = weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
  const maxCompletions = Math.max(...weeklyHistory.map((day) => day.completionsCount), 1);
  const averageMoodSource = weeklyHistory.filter((day) => day.mood !== null);
  const moodAverage =
    averageMoodSource.length > 0
      ? Math.round(
          averageMoodSource.reduce((sum, day) => sum + (day.mood ?? 0), 0) /
            averageMoodSource.length,
        )
      : null;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const completionOffset = ringCircumference - ringCircumference * getProgress(brightDays, 7);

  return (
    <div className="grid gap-4">
      <section className="app-hero overflow-hidden rounded-[32px] px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Reflection
        </div>
        <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-tight text-slate-950">
          Here&apos;s how the week is holding.
        </h2>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-slate-600">
          Three reads: days held, pressure, and mood.
        </p>

        <div className="mt-6 rounded-[28px] border border-[#ecd9df] bg-white/78 p-4 shadow-[0_18px_40px_-30px_rgba(214,173,183,0.22)]">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="relative h-[6.2rem] w-[6.2rem] shrink-0">
              <svg viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r={ringRadius} stroke="rgba(223,199,208,0.78)" strokeWidth="8" fill="none" />
                <circle
                  cx="42"
                  cy="42"
                  r={ringRadius}
                  stroke="url(#weekHeroRing)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={completionOffset}
                />
                <defs>
                  <linearGradient id="weekHeroRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd68b" />
                    <stop offset="100%" stopColor="#69d7ca" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-semibold text-slate-950">{brightDays}/7</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">days held</div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-950">This week, at a glance</div>
              <div className="mt-1 text-sm leading-6 text-slate-600">
                {brightDays} days held, {calmDays} steadier day{calmDays === 1 ? "" : "s"}, mood {moodAverage ? moodTone[moodAverage].toLowerCase() : "unmarked"}.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
                  {totalCompletions} holds
                </span>
                <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
                  {calmDays} steady
                </span>
                <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
                  Mood {moodAverage ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-3">
        <article className="rounded-[28px] border border-[#ecd9df] bg-white/78 p-5 shadow-[0_18px_40px_-30px_rgba(214,173,183,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Week at a glance</div>
              <div className="mt-1 text-sm text-slate-600">
                Taller bars mean more holds. Dots show mood. Small chips show resisted urges.
              </div>
            </div>
            <div className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm font-medium text-slate-700">
              {totalCompletions} holds
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {weeklyHistory.map((day) => {
              const barHeight = `${Math.max((day.completionsCount / maxCompletions) * 100, day.completionsCount > 0 ? 18 : 8)}%`;
              const moodColor =
                day.mood === null
                  ? "bg-[#f1dde4]"
                  : day.mood <= 2
                    ? "bg-[#ffb5bd]"
                    : day.mood === 3
                      ? "bg-[#ffd98f]"
                      : "bg-[#69d7ca]";

              return (
                <div
                  key={day.date}
                  className="rounded-[22px] border border-[#ecd9df] bg-[#fff9fb] px-2 py-3"
                >
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {day.label.split(",")[0]}
                  </div>
                  <div className="mt-3 flex h-28 items-end justify-center">
                    <div className="flex h-full w-8 items-end rounded-full bg-[#f7e9ee] p-1">
                      <div
                        className={`w-full rounded-full ${
                          day.completed
                            ? "bg-[linear-gradient(180deg,#8be6dc_0%,#6cc8f4_100%)]"
                            : "bg-[linear-gradient(180deg,#ffd68b_0%,#ffb5bd_100%)]"
                        }`}
                        style={{ height: barHeight }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${moodColor}`} />
                    <span className="text-xs font-medium text-slate-600">
                      {day.completionsCount}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <span className="rounded-full border border-[#ecd9df] bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {day.resistedCount}R
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-[28px] border border-[#ecd9df] bg-white/78 p-5 shadow-[0_18px_40px_-30px_rgba(214,173,183,0.2)]">
            <div className="text-sm font-semibold text-slate-950">Best day</div>
            <div className="mt-2 text-base leading-7 text-slate-700">
              {bestDay && bestDay.completionsCount > 0
                ? `${bestDay.label} carried ${bestDay.completionsCount} hold${bestDay.completionsCount === 1 ? "" : "s"}.`
                : "No single day stood out yet."}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#ecd9df] bg-white/78 p-5 shadow-[0_18px_40px_-30px_rgba(214,173,183,0.2)]">
            <div className="text-sm font-semibold text-slate-950">Practice mix</div>
            <div className="mt-1 text-sm text-slate-600">
              What you are trying to repeat, and what you are trying to loosen.
            </div>

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="h-3 overflow-hidden rounded-full bg-[#f7e9ee]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#8be6dc_0%,#ffd68b_100%)]"
                  style={{
                    width: `${stats.totalHabits > 0 ? (stats.buildHabits / stats.totalHabits) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="text-sm font-medium text-slate-700">
                {stats.buildHabits} repeat / {stats.breakHabits} loosen
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
