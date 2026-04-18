"use client";

import { HabitType } from "@prisma/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

type HabitListProps = {
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
  dayCompleted: boolean;
};

export function HabitList({ habits, dayCompleted }: HabitListProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? null;

  async function completeHabit(habitId: string) {
    setError("");

    const response = await fetch(`/api/habits/${habitId}/complete`, {
      method: "POST",
    });

    if (!response.ok) {
      setError("Unable to record the minimum action.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card
      title="Minimum actions"
      description="One completion is enough to win the day. Build habits get done, break habits get logged when you successfully interrupt the loop."
      action={
        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            dayCompleted ? "bg-[#1d3b2a] text-[#72d397]" : "bg-white/[0.05] text-white/72"
          }`}
        >
          {dayCompleted ? "Day completed" : "Day not won yet"}
        </div>
      }
    >
      {habits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/72">
          Add your first habit to start tracking minimum actions and urge logs.
        </p>
      ) : (
        <div className="grid gap-3">
          {habits.map((habit) => (
            <article
              key={habit.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
            >
              <button
                type="button"
                onClick={() => setSelectedHabitId(habit.id)}
                className="min-w-0 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{habit.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      habit.type === "BUILD"
                        ? "bg-[#1d2d4e] text-[#8fb0ff]"
                        : "bg-[#3b1e23] text-[#f18da0]"
                    }`}
                  >
                    {habit.type === "BUILD" ? "Build" : "Break"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <span>{habit.completedToday ? "Held today" : "Not held yet"}</span>
                  <span className="text-white/45">•</span>
                  <span>{habit.stats.totalCompletions} total reps</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => completeHabit(habit.id)}
                disabled={habit.completedToday || isPending}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  habit.completedToday
                    ? "cursor-not-allowed bg-[#1d3b2a] text-[#72d397]"
                    : "bg-[#2d2d2f] text-white hover:bg-[#3a3a3d] disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {habit.completedToday ? "Done today" : "Mark minimum action done"}
              </button>
            </article>
          ))}
        </div>
      )}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {selectedHabit ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/55">
          <button
            type="button"
            aria-label="Close habit details"
            onClick={() => setSelectedHabitId(null)}
            className="absolute inset-0"
          />
          <div
            className="relative z-10 w-full rounded-t-[32px] border border-white/8 bg-[#1a1a1a] p-5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.95)]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-white">{selectedHabit.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      selectedHabit.type === "BUILD"
                        ? "bg-[#1d2d4e] text-[#8fb0ff]"
                        : "bg-[#3b1e23] text-[#f18da0]"
                    }`}
                  >
                    {selectedHabit.type === "BUILD" ? "Build" : "Break"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Minimum action: {selectedHabit.minimumAction}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHabitId(null)}
                className="min-h-11 rounded-full bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/78"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Total reps</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.totalCompletions}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Last 7 days</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.completionsLast7Days}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Urges</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.totalUrges}
                </div>
                <div className="mt-1 text-xs text-white/70">
                  {selectedHabit.stats.resistedUrges} resisted, {selectedHabit.stats.actedUrges} acted
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                  Avg intensity
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.averageUrgeIntensity ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Latest activity</div>
              <div className="mt-2 text-sm text-white/72">
                {selectedHabit.stats.lastCompletedAtLabel
                  ? `Last completed ${selectedHabit.stats.lastCompletedAtLabel}`
                  : "No completion logged yet."}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void completeHabit(selectedHabit.id);
                setSelectedHabitId(null);
              }}
              disabled={selectedHabit.completedToday || isPending}
              className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                selectedHabit.completedToday
                  ? "cursor-not-allowed bg-[#1d3b2a] text-[#72d397]"
                  : "bg-[#3554d1] text-white hover:bg-[#4565eb] disabled:cursor-not-allowed disabled:opacity-60"
              }`}
            >
              {selectedHabit.completedToday ? "Done today" : "Mark minimum action done"}
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
