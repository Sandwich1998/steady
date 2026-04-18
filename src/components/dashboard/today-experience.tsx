"use client";

import { HabitType } from "@prisma/client";
import { useEffect, useState } from "react";

import { DayResetCard } from "@/components/dashboard/day-reset-card";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { UrgeForm } from "@/components/dashboard/urge-form";
import { AppMark } from "@/components/ui/app-mark";

type TodayExperienceProps = {
  dayReset: {
    mood: number;
    startedAt: string;
    startedAtLabel: string;
  } | null;
  dayCompleted: boolean;
  habits: {
    id: string;
    name: string;
    type: HabitType;
    minimumAction: string;
    completedToday: boolean;
    stats: {
      totalCompletions: number;
      completionsLast7Days: number;
      lastCompletedAt: string | null;
      lastCompletedAtLabel: string | null;
      totalUrges: number;
      resistedUrges: number;
      actedUrges: number;
      averageUrgeIntensity: number | null;
    };
  }[];
};

const moodLabels: Record<number, string> = {
  1: "Drained",
  2: "Off",
  3: "Steady",
  4: "Good",
  5: "Great",
};

function getProgress(completedCount: number, totalCount: number) {
  if (totalCount === 0) return 0;
  return Math.min(completedCount / totalCount, 1);
}

export function TodayExperience({
  dayReset,
  dayCompleted,
  habits,
}: TodayExperienceProps) {
  const completedCount = habits.filter((habit) => habit.completedToday).length;
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const nextHabit = habits.find((habit) => !habit.completedToday) ?? habits[0] ?? null;
  const totalHabits = Math.max(habits.length, 1);
  const progress = getProgress(completedCount, totalHabits);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - circumference * animatedProgress;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnimatedProgress(progress);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  const heroTitle = !dayReset
    ? "Start soft. Set the tone first."
    : dayCompleted
      ? "Today is already yours."
      : nextHabit
        ? `Your next step is ${nextHabit.name}.`
        : "One tiny action can still carry the day.";

  const heroSubtitle = !dayReset
    ? "A quick check-in makes the rest of the day easier to hold."
    : dayCompleted
      ? "You already locked in a win. Anything else is a bonus."
      : nextHabit
        ? nextHabit.minimumAction
        : "You can still win today with one small move.";

  const heroStatus = !dayReset
    ? "Check in first"
    : dayCompleted
      ? `${moodLabels[dayReset.mood]} mood • day already won`
      : nextHabit
        ? `${moodLabels[dayReset.mood]} mood • next: ${nextHabit.name}`
        : `${moodLabels[dayReset.mood]} mood • still open`;

  const primaryActionLabel = !dayReset
    ? "Begin with a check-in"
    : nextHabit && !dayCompleted
      ? `Take ${nextHabit.name}`
      : "Take next step";

  function handlePrimaryAction() {
    const targetId = dayReset ? "today-habits" : "daily-reset";
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openUrgeSheet() {
    window.dispatchEvent(new CustomEvent("steady:open-urge-sheet"));
  }

  return (
    <div className="mt-4 grid gap-4">
      <section className="app-hero relative overflow-hidden rounded-[34px] px-5 py-6">
        <div className="pointer-events-none absolute -right-10 top-5 h-32 w-32 rounded-full bg-[rgba(184,179,255,0.18)] blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[rgba(255,200,155,0.16)] blur-3xl" />

        <div className="relative">
          <div className="max-w-[15rem]">
            <div className="flex items-center gap-2">
              <AppMark size="sm" />
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f7d98e]">
                Today
              </div>
            </div>
            <h2 className="mt-3 text-[2.15rem] font-semibold leading-[0.98] tracking-tight text-white">
              {heroTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/74">{heroSubtitle}</p>
            <div className="app-chip mt-4 inline-flex max-w-full items-center rounded-full px-3 py-2 text-sm font-medium text-white/82">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent-mint)] shadow-[0_0_14px_rgba(121,219,198,0.75)]" />
              <span className="truncate">{heroStatus}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="pressable app-btn-primary min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold"
            >
              {primaryActionLabel}
            </button>
            {breakHabits.length > 0 ? (
              <button
                type="button"
                onClick={openUrgeSheet}
                className="pressable app-btn-secondary min-h-11 w-full rounded-full px-5 py-3 text-sm font-medium text-white/86"
              >
                Need urge support
              </button>
            ) : null}
          </div>

          <div className="app-card-soft mt-6 rounded-[26px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Today</div>
                <div className="mt-1 text-sm text-white/62">
                  {dayCompleted
                    ? "You already held the day."
                    : "One more small action can still lock in the win."}
                </div>
              </div>
              <div className="app-chip rounded-full px-3 py-1.5 text-sm font-medium text-white/78">
                {completedCount}/{totalHabits} held
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative shrink-0">
                <svg viewBox="0 0 132 132" className="h-[7.2rem] w-[7.2rem] -rotate-90">
                  <circle
                    cx="66"
                    cy="66"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="66"
                    cy="66"
                    r={radius}
                    stroke="url(#todayProgressRing)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <defs>
                    <linearGradient id="todayProgressRing" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[1.55rem] font-semibold text-white">
                    {completedCount}/{totalHabits}
                  </div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                    today
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="grid gap-2">
                  {habits.slice(0, 4).map((habit) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          habit.completedToday ? "bg-white" : "bg-white/24"
                        }`}
                      />
                      <div className="min-w-0 text-sm text-white/76">
                        <span className="font-medium text-white">
                          {habit.completedToday ? "Held" : "Open"}
                        </span>{" "}
                        <span className="truncate">{habit.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!dayReset ? <DayResetCard currentMood={null} startedAt={null} startedAtLabel={null} /> : null}

      {dayReset ? <TodayHabits habits={habits} /> : null}

      <UrgeForm
        habits={habits.map((habit) => ({
          id: habit.id,
          name: habit.name,
          type: habit.type,
        }))}
        hiddenUntilOpen
      />
    </div>
  );
}
