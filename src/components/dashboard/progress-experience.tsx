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

export function ProgressExperience({ stats, weeklyHistory }: ProgressExperienceProps) {
  const brightDays = weeklyHistory.filter((day) => day.completed).length;
  const calmDays = weeklyHistory.filter((day) => day.resistedCount >= day.actedCount).length;
  const aliveDays = weeklyHistory.filter((day) => day.mood !== null).length;
  const bestDay = [...weeklyHistory].sort((a, b) => b.completionsCount - a.completionsCount)[0] ?? null;
  const totalCompletions = weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
  const totalActed = weeklyHistory.reduce((sum, day) => sum + day.actedCount, 0);
  const averageMoodSource = weeklyHistory.filter((day) => day.mood !== null);
  const moodAverage =
    averageMoodSource.length > 0
      ? Math.round(
          averageMoodSource.reduce((sum, day) => sum + (day.mood ?? 0), 0) /
            averageMoodSource.length,
        )
      : null;

  return (
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(124,108,255,0.22),transparent_38%),radial-gradient(circle_at_18%_22%,rgba(247,201,91,0.18),transparent_26%),linear-gradient(180deg,#181629_0%,#111111_100%)] px-5 py-6 shadow-[0_32px_90px_-48px_rgba(124,108,255,0.85)]">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
          Reflection
        </div>
        <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-tight text-white">
          The week feels more shaped now.
        </h2>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-white/72">
          Progress lives in return, not perfection. This view is for noticing the pattern, not judging it.
        </p>

        <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Glow path</div>
              <div className="mt-1 text-sm text-white/62">
                Each lit node is a day where you moved the week forward.
              </div>
            </div>
            <div className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/78">
              {brightDays}/7 lit
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {weeklyHistory.map((day, index) => (
              <div key={day.date} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold ${
                      day.completed
                        ? "border-[#f7c85e]/55 bg-[radial-gradient(circle_at_35%_35%,#fff5c4_0%,#f7bf4c_42%,#f08c35_100%)] text-black shadow-[0_18px_44px_-24px_rgba(251,191,36,0.9)]"
                        : day.mood
                          ? "border-white/10 bg-white/[0.06] text-white"
                          : "border-white/8 bg-white/[0.03] text-white/45"
                    }`}
                  >
                    {day.completed ? "✦" : day.mood ?? "·"}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {day.label.slice(0, 3)}
                  </div>
                </div>
                {index < weeklyHistory.length - 1 ? (
                  <div
                    className={`h-[2px] flex-1 rounded-full ${
                      day.completed ? "bg-[linear-gradient(90deg,rgba(247,201,91,0.5),rgba(124,108,255,0.35))]" : "bg-white/10"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <article className="rounded-[26px] border border-white/8 bg-[#181818] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Week energy
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {moodAverage ? moodTone[moodAverage] : "Unmarked"}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/68">
              {aliveDays > 0 ? `${aliveDays} check-ins gave this week a clearer tone.` : "No reset pattern yet."}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/8 bg-[#181818] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Pressure balance
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {calmDays > 0 ? `${calmDays} calm` : "Open"}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/68">
              {stats.urgesResisted} resisted, {totalActed} acted. The direction matters more than the total.
            </div>
          </article>
        </div>

        <article className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">What stood out</div>
              <div className="mt-1 text-sm text-white/62">
                A quick read on the week without opening a spreadsheet in your head.
              </div>
            </div>
            <div className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/78">
              {totalCompletions} small wins
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.02] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                Brightest moment
              </div>
              <div className="mt-2 text-base font-semibold text-white">
                {bestDay && bestDay.completionsCount > 0
                  ? `${bestDay.label} carried ${bestDay.completionsCount} meaningful step${bestDay.completionsCount === 1 ? "" : "s"}.`
                  : "No standout day yet. The next one can still be enough."}
              </div>
            </div>

            <div className="grid gap-2">
              {weeklyHistory.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.02] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{day.label}</div>
                    <div className="mt-1 text-sm text-white/62">
                      {day.completed
                        ? `${day.completionsCount} step${day.completionsCount === 1 ? "" : "s"} landed`
                        : day.mood
                          ? `${moodTone[day.mood]} tone, still open`
                          : "Day stayed quiet"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-sm text-white/74">
                      {day.resistedCount} held
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        day.completed ? "bg-[#1d3b2a] text-[#72d397]" : "bg-white/[0.06] text-white/72"
                      }`}
                    >
                      {day.completed ? "Lit" : "Open"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Your practice mix</div>
          <div className="mt-1 text-sm text-white/62">
            What you are building and what you are trying to soften.
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7c6cff_0%,#f7c95b_100%)]"
                style={{
                  width: `${stats.totalHabits > 0 ? (stats.buildHabits / stats.totalHabits) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-sm font-medium text-white/78">
              {stats.buildHabits} grow / {stats.breakHabits} soften
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
