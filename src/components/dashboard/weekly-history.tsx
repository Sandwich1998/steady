import { Card } from "@/components/ui/card";

type WeeklyHistoryProps = {
  days: {
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

export function WeeklyHistory({ days }: WeeklyHistoryProps) {
  return (
    <Card
      title="7-day history"
      description="A compact weekly read on mood, minimum-action wins, and urge pressure."
    >
      <div className="grid gap-3">
        {days.map((day) => (
          <article
            key={day.date}
            className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[0.85fr_0.7fr_1fr_1fr]"
          >
            <div>
              <div className="text-sm font-semibold text-white">{day.label}</div>
              <div className="text-xs text-white/70">{day.date}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Reset</div>
              <div className="mt-1 text-sm font-medium text-white/82">
                {day.mood ? `Mood ${day.mood}` : "No reset"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Day win</div>
              <div
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  day.completed
                    ? "bg-[#1d3b2a] text-[#72d397]"
                    : "bg-white/[0.06] text-white/72"
                }`}
              >
                {day.completed ? `Won with ${day.completionsCount}` : "Not completed"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Urges</div>
              <div className="mt-1 text-sm font-medium text-white/82">
                {day.urgesCount} total
              </div>
              <div className="text-xs text-white/70">
                {day.resistedCount} resisted, {day.actedCount} acted
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
