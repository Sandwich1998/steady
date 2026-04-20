"use client";

import { HabitType } from "@prisma/client";

import { DayResetCard } from "@/components/dashboard/day-reset-card";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { TodayOrbit } from "@/components/dashboard/today-orbit";
import { UrgeForm } from "@/components/dashboard/urge-form";

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
    restedToday: boolean;
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

export function TodayExperience({
  dayReset,
  dayCompleted,
  habits,
}: TodayExperienceProps) {
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const nextHabit = habits.find((habit) => !habit.completedToday && !habit.restedToday) ?? null;

  const heroTitle = !dayReset
    ? "Start with one check-in."
    : dayCompleted
      ? "You're done for today."
      : nextHabit
        ? "Return to what helps."
        : "One hold still counts.";

  const heroSubtitle = !dayReset
    ? "Check in, return to supportive practices, and catch harder patterns earlier."
    : dayCompleted
      ? "Come back tomorrow and start small again."
      : nextHabit
        ? nextHabit.minimumAction
        : "There is still one clean move left.";

  const heroStatus = !dayReset
    ? "Not checked in yet"
    : dayCompleted
      ? `${moodLabels[dayReset.mood]} mood • wrapped for today`
      : nextHabit
        ? `${moodLabels[dayReset.mood]} mood • one step at a time`
        : `${moodLabels[dayReset.mood]} mood • day open`;

  const primaryActionLabel = !dayReset
    ? "Start check-in"
    : nextHabit && !dayCompleted
      ? "Do one small step"
      : "See today's habits";

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
    <div className="mt-4 grid gap-5">
      <section className="app-hero relative overflow-hidden rounded-[34px] px-5 py-6">
        <div className="pointer-events-none absolute -right-10 top-5 h-32 w-32 rounded-full bg-[rgba(184,179,255,0.18)] blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[rgba(255,200,155,0.16)] blur-3xl" />

        <div className="relative">
          <div className="max-w-[16rem]">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f19a8d]">
              Today
            </div>
            <h2 className="mt-3 text-[2.15rem] font-semibold leading-[0.98] tracking-tight text-slate-950">
              {heroTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{heroSubtitle}</p>
            <div className="app-chip mt-4 inline-flex max-w-full items-center rounded-full px-3 py-2 text-sm font-medium text-slate-700">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent-mint)] shadow-[0_0_14px_rgba(105,215,202,0.5)]" />
              <span className="truncate">{heroStatus}</span>
            </div>
          </div>

          <TodayOrbit
            habits={habits}
            nextHabit={nextHabit}
            dayCompleted={dayCompleted}
          />

          <div className="mt-5 grid gap-3">
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
                className="pressable min-h-11 w-full rounded-full bg-white/62 px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_14px_32px_-26px_rgba(214,173,183,0.22)]"
              >
                Support for hard moments
              </button>
            ) : null}
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
