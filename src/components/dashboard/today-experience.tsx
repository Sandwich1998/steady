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
  weeklyHistory: {
    date: string;
    mood: number | null;
    completed: boolean;
    completionsCount: number;
    restCount: number;
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

export function TodayExperience({
  dayReset,
  dayCompleted,
  habits,
  weeklyHistory,
}: TodayExperienceProps) {
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const nextHabit = habits.find((habit) => !habit.completedToday && !habit.restedToday) ?? null;
  const completedTodayCount = habits.filter((habit) => habit.completedToday).length;
  const actedToday = weeklyHistory.at(-1)?.actedCount ?? 0;
  const checkedInDays = weeklyHistory.filter((day) => day.mood !== null).length;
  const resetDay = Math.min(Math.max(checkedInDays + (dayReset ? 0 : 1), 1), 7);
  const resetPhase =
    resetDay <= 2
      ? {
          label: "Day 1-2",
          title: "Today support",
          copy: "Keep it small: water, movement, food, and one delay.",
        }
      : resetDay <= 4
        ? {
            label: "Day 3-4",
            title: "Today support",
            copy: "Expect bargaining. Move first, decide later.",
          }
        : {
            label: "Day 5-7",
            title: "Today support",
            copy: "Protect the easy anchors before the evening pull starts.",
          };
  const supportAnchors = actedToday > 0
    ? ["Drink water", "Change rooms", "Phone away", "One small step"]
    : resetDay <= 2
      ? ["Water", "No phone", "Move 5 min", "Real meal"]
      : resetDay <= 4
        ? ["Stand up", "Leave room", "Walk", "Delay 10 min"]
        : ["Phone away", "Walk or gym", "Tea/shower", "Lights down"];

  const heroTitle = !dayReset
    ? "Set up the next few hours."
    : dayCompleted
      ? actedToday > 0
        ? "You came back today."
        : "You can leave it here today."
      : nextHabit
        ? "Do the next useful thing."
        : "Keep the day easy to finish.";

  const heroSubtitle = !dayReset
    ? "Start the reset, choose one anchor, and keep urge support close."
    : dayCompleted
      ? "A hard moment is not the whole day. Come back tomorrow and start small again."
      : nextHabit
        ? nextHabit.minimumAction
        : "If an urge shows up, delay it and change rooms.";

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
        <div className="pointer-events-none absolute right-0 top-5 h-28 w-28 rounded-full bg-[rgba(184,179,255,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute left-0 bottom-0 h-24 w-24 rounded-full bg-[rgba(255,200,155,0.14)] blur-3xl" />

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
            {breakHabits.length > 0 ? (
              <button
                type="button"
                onClick={openUrgeSheet}
                className="pressable app-btn-primary min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold"
              >
                Urge hitting now
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePrimaryAction}
              className={`pressable min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold ${
                breakHabits.length > 0
                  ? "bg-white/62 text-slate-700 shadow-[0_14px_32px_-26px_rgba(214,173,183,0.22)]"
                  : "app-btn-primary"
              }`}
            >
              {primaryActionLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <article className="rounded-[30px] bg-white/74 px-5 py-5 shadow-[0_16px_38px_-34px_rgba(214,173,183,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-950">
                {actedToday > 0 ? "Pick back up from here" : resetPhase.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {actedToday > 0
                  ? "One moment is not the whole day. Come back with one next step."
                  : resetPhase.copy}
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-[#fff2f6] px-3 py-1.5 text-xs font-semibold text-slate-600">
              {resetPhase.label}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {supportAnchors.map((anchor) => (
              <div key={anchor} className="rounded-[18px] bg-[#fff8fb] px-3 py-3 text-sm font-medium text-slate-700">
                {anchor}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-full bg-white/62 px-3 py-2 text-center text-sm font-medium text-slate-600">
              {completedTodayCount}/{habits.length || 1} practices held today
            </div>
            <button
              type="button"
              onClick={actedToday > 0 ? handlePrimaryAction : breakHabits.length > 0 ? openUrgeSheet : handlePrimaryAction}
              className="pressable min-h-12 rounded-full bg-white/86 px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_12px_26px_-24px_rgba(214,173,183,0.22)]"
            >
              {actedToday > 0 ? "Choose next step" : breakHabits.length > 0 ? "Open support" : "Start one step"}
            </button>
          </div>
        </article>
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
