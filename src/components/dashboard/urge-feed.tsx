import { HabitType, UrgeOutcome } from "@prisma/client";

type UrgeFeedProps = {
  recentUrges: {
    id: string;
    habitName: string;
    habitType: HabitType;
    intensity: number;
    outcome: UrgeOutcome;
    createdAt: string;
    createdAtLabel: string;
  }[];
};

export function UrgeFeed({ recentUrges }: UrgeFeedProps) {
  const visibleUrges = recentUrges.slice(0, 4);
  const resistedCount = recentUrges.filter((urge) => urge.outcome === "RESISTED").length;

  return (
    <section className="border-t border-white/6 px-5 pt-5">
      <div className="max-w-[18rem]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Recent urges
        </div>
        <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-zinc-50">
          Hard moments, clearly logged
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {recentUrges.length > 0
            ? `You got through ${resistedCount} of the last ${recentUrges.length} urge moments.`
            : "A simple read on how hard moments went."}
        </p>
      </div>
      {recentUrges.length === 0 ? (
        <p className="mt-4 rounded-[14px] bg-white/4 p-4 text-sm text-zinc-400">
          No urge moments yet. If one hits, you can log it here.
        </p>
      ) : (
        <div className="relative mt-5">
          <div className="pointer-events-none absolute bottom-0 left-[7px] top-1 w-px bg-white/8" />
          <div className="grid gap-4">
            {visibleUrges.map((urge) => (
              <article
                key={urge.id}
                className="relative grid grid-cols-[auto_1fr_auto] items-start gap-3"
              >
                <div
                  className={`mt-1.5 h-4 w-4 rounded-full border ${
                    urge.outcome === "RESISTED"
                      ? "border-[rgba(105,215,202,0.55)] bg-[var(--accent-mint)] shadow-[0_0_14px_rgba(105,215,202,0.45)]"
                      : "border-[rgba(255,158,165,0.55)] bg-[var(--accent-rose)] shadow-[0_0_14px_rgba(255,158,165,0.35)]"
                  }`}
                />
                <div className="min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-zinc-50">
                        {urge.habitName}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {urge.outcome === "RESISTED" ? "Got through it" : "Acted on it"}{" "}
                        <span className="text-zinc-500">· {urge.createdAtLabel}</span>
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-white/6 px-2.5 py-1 text-xs font-medium text-zinc-400">
                      {urge.intensity}/5
                    </div>
                  </div>
                </div>
                <div className="pt-0.5 text-right text-xs font-medium text-zinc-500">
                  {urge.outcome === "RESISTED" ? "Resisted" : "Acted"}
                </div>
              </article>
            ))}
          </div>
          {recentUrges.length > visibleUrges.length ? (
            <div className="pt-1 text-center text-xs font-medium text-zinc-500">
              Showing latest {visibleUrges.length}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
