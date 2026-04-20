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
  const resistedCount = recentUrges.filter((urge) => urge.outcome === "RESISTED").length;

  return (
    <Card
      title="Recent urge moments"
      description={
        recentUrges.length > 0
          ? `You got through ${resistedCount} of the last ${recentUrges.length}.`
          : "A gentle record of how hard moments went."
      }
      variant="soft"
    >
      {recentUrges.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#ecd9df] bg-white/76 p-4 text-sm text-slate-600">
          No urge moments yet. When one hits, mark it and keep moving.
        </p>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-[7px] top-1 w-px bg-[#ecd9df]" />
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
                <div className="min-w-0 border-b border-[#f1dde4] pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {urge.habitName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {urge.outcome === "RESISTED" ? "You got through it" : "It got the better of you"}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-[#fff7fb] px-2.5 py-1 text-xs font-medium text-slate-500">
                      {urge.intensity}/5
                    </div>
                  </div>
                </div>
                <div className="pt-0.5 text-right text-sm text-slate-500">
                  {urge.createdAtLabel}
                </div>
              </article>
            ))}
          </div>
          {recentUrges.length > visibleUrges.length ? (
            <div className="text-center text-xs font-medium text-slate-500">
              Showing latest {visibleUrges.length}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
