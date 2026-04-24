import { HabitType } from "@prisma/client";

type TodayOrbitProps = {
  habits: {
    id: string;
    name: string;
    type: HabitType;
    completedToday: boolean;
    restedToday: boolean;
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
  const restedCount = habits.filter((habit) => habit.restedToday).length;
  const totalHabits = Math.max(habits.length, 1);
  const progress = Math.min((completedCount + restedCount) / totalHabits, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - circumference * progress;
  const center = 66;

  return (
    <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[22px] bg-white/[0.03] px-4 py-4">
      <div className="relative shrink-0">
        <svg viewBox="0 0 132 132" className="h-[7.15rem] w-[7.15rem] -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius - 13}
            fill="rgba(255,255,255,0.04)"
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
            stroke="rgba(255,255,255,0.06)"
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
              <stop offset="0%" stopColor="#25f4ee" />
              <stop offset="100%" stopColor="#fe2c55" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[1.55rem] font-semibold text-zinc-50">
            {completedCount + restedCount}/{totalHabits}
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            done
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-300">
          {dayCompleted ? "Wrapped for today" : "Still open today"}
        </div>
        <div className="mt-2 text-lg font-semibold leading-tight text-zinc-50">
          {dayCompleted ? "All set for today." : "Keep today steady."}
        </div>
        <div className="mt-2 text-sm leading-6 text-zinc-400">
          {dayCompleted
            ? "Come back tomorrow. If the day gets wobbly later, support is still here."
            : nextHabit?.minimumAction ?? "Set one practice and the ring will start to fill."}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/6 px-3 py-1.5 text-sm text-zinc-300">
            {Math.max(totalHabits - completedCount - restedCount, 0)} left
          </span>
          {restedCount > 0 ? (
            <span className="rounded-full bg-white/6 px-3 py-1.5 text-sm text-zinc-300">
              {restedCount} rest day{restedCount === 1 ? "" : "s"}
            </span>
          ) : null}
          {nextHabit && !dayCompleted ? (
            <span className="rounded-full bg-white/6 px-3 py-1.5 text-sm text-zinc-300">
              {nextHabit.type === "BUILD" ? "Repeat" : "Loosen"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
