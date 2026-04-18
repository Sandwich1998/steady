import { HabitType } from "@prisma/client";

type TodayOrbitProps = {
  habits: {
    id: string;
    name: string;
    type: HabitType;
    completedToday: boolean;
    minimumAction: string;
  }[];
  nextHabit:
    | {
        id: string;
        name: string;
        type: HabitType;
        minimumAction: string;
      }
    | null
    | undefined;
  dayCompleted: boolean;
};

export function TodayOrbit({ habits, nextHabit, dayCompleted }: TodayOrbitProps) {
  const completedCount = habits.filter((habit) => habit.completedToday).length;
  const totalHabits = Math.max(habits.length, 1);
  const progress = Math.min(completedCount / totalHabits, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - circumference * progress;
  const center = 66;

  return (
    <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[28px] border border-white/8 bg-white/[0.04] px-4 py-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 132 132" className="h-[7.15rem] w-[7.15rem] -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius - 13}
            fill="rgba(255,255,255,0.028)"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="9"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius - 8}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#todayOrbitRing)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
          <defs>
            <linearGradient id="todayOrbitRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(246,250,247,0.98)" />
              <stop offset="100%" stopColor="rgba(216,177,140,0.62)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[1.55rem] font-semibold text-white">
            {completedCount}/{totalHabits}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/42">
            held
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/48">
          {dayCompleted ? "Done today" : "Next hold"}
        </div>
        <div className="mt-2 text-lg font-semibold leading-tight text-white">
          {dayCompleted ? "You're done for today." : nextHabit?.name ?? "Pick one practice."}
        </div>
        <div className="mt-2 text-sm leading-6 text-white/70">
          {dayCompleted
            ? "Come back tomorrow. Urge help is still here if the day gets wobbly."
            : nextHabit?.minimumAction ?? "Set one practice and the ring will start to fill."}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-sm text-white/76">
            {totalHabits - completedCount} left
          </span>
          {nextHabit && !dayCompleted ? (
            <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-sm text-white/76">
              {nextHabit.type === "BUILD" ? "Repeat" : "Loosen"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
