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
    <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[28px] border border-[#ecd9df] bg-white/78 px-4 py-4 shadow-[0_18px_40px_-28px_rgba(214,173,183,0.26)]">
      <div className="relative shrink-0">
        <svg viewBox="0 0 132 132" className="h-[7.15rem] w-[7.15rem] -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius - 13}
            fill="rgba(255,228,233,0.48)"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(223,199,208,0.8)"
            strokeWidth="9"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius - 8}
            stroke="rgba(244,230,234,0.95)"
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
              <stop offset="0%" stopColor="#ffc978" />
              <stop offset="100%" stopColor="#69d7ca" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[1.55rem] font-semibold text-slate-950">
            {completedCount + restedCount}/{totalHabits}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
            done
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-700">
          {dayCompleted ? "Done today" : "Still open today"}
        </div>
        <div className="mt-2 text-lg font-semibold leading-tight text-slate-950">
          {dayCompleted ? "You're done for today." : "Keep going today."}
        </div>
        <div className="mt-2 text-sm leading-6 text-slate-600">
          {dayCompleted
            ? "Come back tomorrow. Urge help is still here if the day gets wobbly."
            : nextHabit?.minimumAction ?? "Set one practice and the ring will start to fill."}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm text-slate-700">
            {Math.max(totalHabits - completedCount - restedCount, 0)} left
          </span>
          {restedCount > 0 ? (
            <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm text-slate-700">
              {restedCount} resting
            </span>
          ) : null}
          {nextHabit && !dayCompleted ? (
            <span className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-3 py-1.5 text-sm text-slate-700">
              {nextHabit.type === "BUILD" ? "Repeat" : "Loosen"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
