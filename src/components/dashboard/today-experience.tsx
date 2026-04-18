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
  weeklyHistory,
}: TodayExperienceProps) {
  const completedCount = habits.filter((habit) => habit.completedToday).length;
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const nextHabit = habits.find((habit) => !habit.completedToday) ?? habits[0] ?? null;
  const progress = getProgress(completedCount, Math.max(habits.length, 1));
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = 60;
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

  const primaryActionLabel = !dayReset
    ? "Begin with a check-in"
    : dayCompleted
      ? "See your progress"
      : nextHabit
        ? "Do the next tiny win"
        : "Choose one tiny win";

  function handlePrimaryAction() {
    if (!dayReset) {
      document.getElementById("daily-reset")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    if (dayCompleted) {
      document.getElementById("bottom-nav-progress")?.click();
      return;
    }

    document.getElementById("today-habits")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openUrgeSheet() {
    window.dispatchEvent(new CustomEvent("steady:open-urge-sheet"));
  }

  return (
    <div className="mt-4 grid gap-4">
      <section className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(247,201,91,0.2),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(124,108,255,0.22),transparent_25%),linear-gradient(180deg,#181629_0%,#121212_58%,#101010_100%)] px-5 py-6 shadow-[0_34px_100px_-52px_rgba(124,108,255,0.85)]">
        <div className="pointer-events-none absolute -right-10 top-5 h-32 w-32 rounded-full bg-[#7c6cff]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#f7c95b]/18 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="max-w-[14rem]">
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
          </div>

          <div className="relative shrink-0">
            <svg viewBox="0 0 156 156" className="h-[9.5rem] w-[9.5rem] -rotate-90">
              <circle
                cx="78"
                cy="78"
                r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="78"
                cy="78"
                r={radius}
                stroke="url(#steadyRhythmRing)"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <defs>
                <linearGradient id="steadyRhythmRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f7c95b" />
                  <stop offset="52%" stopColor="#7c6cff" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="animate-ring-breathe flex h-[4.35rem] w-[4.35rem] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff8dc_0%,#f7c95b_42%,#ea8c39_100%)] shadow-[0_16px_40px_-18px_rgba(251,191,36,0.95)]" />
              <div className="mt-3 text-center">
                <div className="text-[1.7rem] font-semibold text-white">
                  {completedCount}/{Math.max(habits.length, 1)}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/52">
                  {dayCompleted ? "day held" : "rhythm ring"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="pressable min-h-11 w-full rounded-full bg-[#3554d1] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_-24px_rgba(69,101,235,1)] hover:bg-[#4565eb]"
          >
            {primaryActionLabel}
          </button>
          {breakHabits.length > 0 ? (
            <button
              type="button"
              onClick={openUrgeSheet}
              className="pressable min-h-11 w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/86 hover:bg-white/[0.06]"
            >
              I feel an urge
            </button>
          ) : null}
        </div>

        <div className="relative mt-5 grid gap-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                How you are
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {dayReset ? moodLabels[dayReset.mood] : "Not checked in"}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                Next
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {dayReset ? (nextHabit ? nextHabit.name : "Any tiny step") : "Check in first"}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">
                Can win?
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {dayCompleted ? "Already won" : "Still open"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {weeklyHistory.slice(-7).map((day) => (
              <div
                key={day.date}
                className={`flex min-w-12 flex-col items-center gap-2 rounded-[18px] px-2 py-3 ${
                  day.completed ? "bg-white/[0.06]" : "bg-white/[0.03]"
                }`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded-full ${
                    day.completed ? "bg-[#f7c95b] shadow-[0_0_18px_rgba(247,201,91,0.9)]" : "bg-white/18"
                  }`}
                />
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {day.label.slice(0, 3)}
                </div>
              </div>
            ))}
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
