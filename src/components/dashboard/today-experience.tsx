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
  const progressStops = weeklyHistory.slice(-7);
  const [animatedProgress, setAnimatedProgress] = useState(0);

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
      <section className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(247,201,91,0.2),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(124,108,255,0.22),transparent_25%),linear-gradient(180deg,#181629_0%,#121212_58%,#101010_100%)] px-5 py-6 shadow-[0_34px_100px_-52px_rgba(124,108,255,0.85)]">
        <div className="pointer-events-none absolute -right-10 top-5 h-32 w-32 rounded-full bg-[#7c6cff]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#f7c95b]/18 blur-3xl" />

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
            <div className="mt-4 inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white/82">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#f7c95b] shadow-[0_0_14px_rgba(247,201,91,0.95)]" />
              <span className="truncate">{heroStatus}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
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
                Need urge support
              </button>
            ) : null}
          </div>

          <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Glow path</div>
                <div className="mt-1 text-sm text-white/62">
                  One lit point means you showed up. That is enough to move the line.
                </div>
              </div>
              <div className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/78">
                {completedCount}/{Math.max(habits.length, 1)} held
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {progressStops.map((day, index) => (
                <div key={day.date} className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        day.completed
                          ? "border-[#f7c85e]/55 bg-[radial-gradient(circle_at_35%_35%,#fff5c4_0%,#f7bf4c_42%,#f08c35_100%)] text-black shadow-[0_18px_40px_-22px_rgba(251,191,36,0.9)]"
                          : day.mood
                            ? "border-white/10 bg-white/[0.06] text-white"
                            : "border-white/8 bg-white/[0.03] text-white/45"
                      }`}
                      style={{
                        transform:
                          index === progressStops.length - 1 && animatedProgress > 0
                            ? `scale(${0.94 + animatedProgress * 0.12})`
                            : undefined,
                      }}
                    >
                      {day.completed ? "✦" : day.mood ?? "·"}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">
                      {day.label.slice(0, 3)}
                    </div>
                  </div>
                  {index < progressStops.length - 1 ? (
                    <div
                      className={`h-[2px] flex-1 rounded-full ${
                        day.completed
                          ? "bg-[linear-gradient(90deg,rgba(247,201,91,0.52),rgba(124,108,255,0.35))]"
                          : "bg-white/10"
                      }`}
                    />
                  ) : null}
                </div>
              ))}
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
