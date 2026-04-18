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
  const calmOffset = ringCircumference - ringCircumference * getProgress(calmDays, 7);
  const moodOffset =
    ringCircumference - ringCircumference * getProgress(moodAverage ?? 0, 5);

  return (
    <div className="grid gap-4">
      <section className="app-hero overflow-hidden rounded-[32px] px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
          Reflection
        </div>
        <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-tight text-white">
          Here&apos;s how the week is holding.
        </h2>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-white/72">
          Three reads: days held, pressure, and mood.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <article className="app-card-soft rounded-[24px] p-4">
            <div className="relative mx-auto h-[5.25rem] w-[5.25rem]">
              <svg viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="42"
                  cy="42"
                  r={ringRadius}
                  stroke="url(#completionRing)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={completionOffset}
                />
                <defs>
                  <linearGradient id="completionRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-semibold text-white">{brightDays}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/38">lit</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-semibold text-white">Days held</div>
            <div className="mt-1 text-center text-sm text-white/62">Days with at least one hold</div>
          </article>

          <article className="app-card-soft rounded-[24px] p-4">
            <div className="relative mx-auto h-[5.25rem] w-[5.25rem]">
              <svg viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="42"
                  cy="42"
                  r={ringRadius}
                  stroke="url(#calmRing)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={calmOffset}
                />
                <defs>
                  <linearGradient id="calmRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.82)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-semibold text-white">{calmDays}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/38">calm</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-semibold text-white">Pressure</div>
            <div className="mt-1 text-center text-sm text-white/62">Days you held more than you gave way</div>
          </article>

          <article className="app-card-soft rounded-[24px] p-4">
            <div className="relative mx-auto h-[5.25rem] w-[5.25rem]">
              <svg viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="42"
                  cy="42"
                  r={ringRadius}
                  stroke="url(#moodRing)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={moodOffset}
                />
                <defs>
                  <linearGradient id="moodRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.74)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-lg font-semibold text-white">{moodAverage ?? "-"}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/38">tone</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm font-semibold text-white">Mood</div>
            <div className="mt-1 text-center text-sm text-white/62">
              {moodAverage ? moodTone[moodAverage] : "Unmarked"}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="app-chip rounded-full px-4 py-2.5 text-sm text-white/78">
            <span className="text-white">Mood:</span> {moodAverage ? moodTone[moodAverage] : "Unmarked"}
          </div>
          <div className="app-chip rounded-full px-4 py-2.5 text-sm text-white/78">
            <span className="text-white">Pressure:</span> {calmDays > 0 ? `${calmDays} steady day${calmDays === 1 ? "" : "s"}` : "No read yet"}
          </div>
          <div className="app-chip rounded-full px-4 py-2.5 text-sm text-white/78">
            <span className="text-white">Holds:</span> {totalCompletions}
          </div>
        </div>

        <article className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Week notes</div>
              <div className="mt-1 text-sm text-white/62">
                A quick read, not a verdict.
              </div>
            </div>
            <div className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/78">
              {totalCompletions} holds logged
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                Most held
              </div>
              <div className="mt-2 text-base font-semibold text-white">
                {bestDay && bestDay.completionsCount > 0
                  ? `${bestDay.label} carried ${bestDay.completionsCount} held step${bestDay.completionsCount === 1 ? "" : "s"}.`
                  : "No day pulled ahead yet."}
              </div>
            </div>

            <div className="grid gap-1">
              {weeklyHistory.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between gap-3 rounded-[18px] px-1 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{day.label}</div>
                    <div className="mt-1 text-sm text-white/62">
                      {day.completed
                        ? `${day.completionsCount} hold${day.completionsCount === 1 ? "" : "s"}`
                        : day.mood
                          ? `${moodTone[day.mood]} mood, no hold`
                          : "No check-in"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-sm text-white/74">
                      {day.resistedCount} resisted
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                        day.completed ? "bg-[#1d3b2a] text-[#72d397]" : "bg-white/[0.06] text-white/72"
                      }`}
                    >
                      {day.completed ? "Held" : "Unheld"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
          <div className="text-sm font-semibold text-white">Practice mix</div>
          <div className="mt-1 text-sm text-white/62">
            What you are trying to repeat, and what you are trying to loosen.
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
              {stats.buildHabits} repeat / {stats.breakHabits} loosen
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
