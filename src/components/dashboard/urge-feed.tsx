import { HabitType, UrgeOutcome } from "@prisma/client";

import { Card } from "@/components/ui/card";

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

  return (
    <Card title="Pressure notes" description="A light look at the latest urge moments.">
      {recentUrges.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/72">
          No recent urge notes. When a moment spikes, log it and let it pass.
        </p>
      ) : (
        <div className="grid gap-3">
          {visibleUrges.map((urge) => (
            <article
              key={urge.id}
              className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">{urge.habitName}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      urge.habitType === "BREAK"
                        ? "bg-[#3b1e23] text-[#f18da0]"
                        : "bg-[#1d2d4e] text-[#8fb0ff]"
                    }`}
                  >
                    {urge.habitType === "BREAK" ? "Break habit" : "Build habit"}
                  </span>
                </div>
                <p className="text-sm text-white/70">
                  {urge.outcome === "RESISTED" ? "Resisted" : "Acted"} at intensity {urge.intensity}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-white/70">{urge.createdAtLabel}</div>
            </article>
          ))}
          {recentUrges.length > visibleUrges.length ? (
            <div className="text-center text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              Showing latest {visibleUrges.length}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
