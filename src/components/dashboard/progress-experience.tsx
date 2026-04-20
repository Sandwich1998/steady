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

const moodTone = ["Quiet", "Low", "Steady", "Good", "Bright", "Strong"] as const;

function getMoodLabel(mood: number | null) {
  return mood ? moodTone[mood] : "Unmarked";
}

function getWeekHeadline(brightDays: number, calmDays: number, moodAverage: number | null) {
  if (brightDays >= 5 && calmDays >= 4) return "You had a steady week";
  if (brightDays >= 4) return "You stayed consistent this week";
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
  const moodText = moodAverage ? getMoodLabel(moodAverage).toLowerCase() : "unmarked";
  return `${totalCompletions} completions. ${calmDays} calmer day${calmDays === 1 ? "" : "s"}. Mood felt ${moodText}.`;
}

export function ProgressExperience({ stats, weeklyHistory }: ProgressExperienceProps) {
  const brightDays = weeklyHistory.filter((day) => day.completed).length;
  const calmDays = weeklyHistory.filter((day) => day.resistedCount >= day.actedCount).length;
  const totalCompletions = weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
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
      ? `${stats.buildHabits} felt supportive, ${stats.breakHabits} may need loosening`
      : "No habits set yet";

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

          <div className="mt-6 grid gap-3">
            <article className="rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,245,250,0.92)_100%)] px-5 py-6 shadow-[0_26px_58px_-36px_rgba(214,173,183,0.34)]">
              <div className="text-sm font-semibold text-slate-700">This week</div>
              <div className="mt-2 text-[2.35rem] font-semibold leading-none tracking-tight text-slate-950">
                {totalCompletions}
              </div>
              <div className="mt-3 text-sm text-slate-600">
                {brightDays} day{brightDays === 1 ? "" : "s"} with at least one completion.
              </div>
            </article>

            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_14px_34px_-30px_rgba(214,173,183,0.16)]">
                <div className="text-sm font-semibold text-slate-700">Calmer days</div>
                <div className="mt-2 text-[1.7rem] font-semibold leading-none text-slate-950">
                  {calmDays}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Days you resisted as much as, or more than, you acted.
                </div>
              </article>

              <article className="rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_14px_34px_-30px_rgba(214,173,183,0.16)]">
                <div className="text-sm font-semibold text-slate-700">Average mood</div>
                <div className="mt-2 text-[1.7rem] font-semibold leading-none text-slate-950">
                  {moodAverage ?? "-"}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {moodAverage ? getMoodLabel(moodAverage) : "No check-ins yet"}
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
          <span className="font-semibold text-slate-900">{totalResisted}</span>
          {totalUrges > 0 ? ` of ${totalUrges}` : ""} urge moments were handled well.
        </div>
      </article>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[28px] bg-white/58 px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
          <div className="text-base font-semibold text-slate-950">Best day</div>
          <div className="mt-3 text-sm leading-6 text-slate-600">
            {bestDay && bestDay.completionsCount > 0
              ? `${bestDay.label} felt strongest with ${bestDay.completionsCount} completion${bestDay.completionsCount === 1 ? "" : "s"}.`
              : "No single day stood out yet."}
          </div>
        </article>

        <article className="rounded-[28px] bg-white/58 px-5 py-5 shadow-[0_10px_24px_-24px_rgba(214,173,183,0.1)]">
          <div className="text-base font-semibold text-slate-950">What helped</div>
          <div className="mt-3 text-sm leading-6 text-slate-600">
            {practiceMixLabel}.
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
            Keep the supportive ones easy to return to. Make the harder ones easier to notice.
          </div>
        </article>
      </section>
    </div>
  );
}
