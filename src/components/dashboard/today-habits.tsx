"use client";

import { HabitType } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type TodayHabitsProps = {
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

export function TodayHabits({ habits }: TodayHabitsProps) {
  const router = useRouter();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ habitId: string; text: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [activeMutationHabitId, setActiveMutationHabitId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const completedCount = habits.filter((habit) => habit.completedToday).length;
  const restedCount = habits.filter((habit) => habit.restedToday).length;
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? null;
  const nextHabit =
    habits.find((habit) => !habit.completedToday && !habit.restedToday) ?? habits[0] ?? null;
  const allHeld = habits.length > 0 && completedCount + restedCount === habits.length;

  useEffect(() => {
    if (!successMessage) return;

    const timeout = window.setTimeout(() => {
      setSuccessMessage((current) =>
        current?.habitId === successMessage.habitId ? null : current,
      );
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  async function completeHabit(habitId: string) {
    if (activeMutationHabitId) return;
    setError("");
    setActiveMutationHabitId(habitId);

    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        setError("Couldn't save that completion.");
        return;
      }

      setCelebratingHabitId(habitId);
      const habit = habits.find((currentHabit) => currentHabit.id === habitId);
      setSuccessMessage({
        habitId,
        text: habit?.completedToday
          ? `${habit.name} is already done today.`
          : `${habit?.name ?? "That practice"} is done for today.`,
      });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(16);
      }
      setTimeout(() => {
        setCelebratingHabitId((current) => (current === habitId ? null : current));
      }, 700);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Couldn't save that completion.");
    } finally {
      setActiveMutationHabitId(null);
    }
  }

  async function restHabit(habitId: string) {
    if (activeMutationHabitId) return;
    setError("");
    setActiveMutationHabitId(habitId);

    try {
      const response = await fetch(`/api/habits/${habitId}/rest`, {
        method: "POST",
      });

      if (!response.ok) {
        setError("Couldn't save that rest day.");
        return;
      }

      const habit = habits.find((currentHabit) => currentHabit.id === habitId);
      setSuccessMessage({
        habitId,
        text: `${habit?.name ?? "That practice"} is resting today.`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Couldn't save that rest day.");
    } finally {
      setActiveMutationHabitId(null);
    }
  }

  function openUrgeSupport() {
    window.dispatchEvent(new CustomEvent("steady:open-urge-sheet"));
  }

  if (habits.length === 0) {
    return (
      <section className="app-card-soft reveal rounded-[28px] border-dashed p-5">
        <div className="text-base font-semibold text-zinc-50">No practices yet</div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Add one practice and this screen will guide you through today.
        </p>
      </section>
    );
  }

  return (
    <>
      <section id="today-habits" className="reveal stagger-2 grid gap-4">
        {allHeld ? (
          <article className="app-card-soft rounded-[28px] px-5 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {restedCount > 0 ? "Wrapped for today" : "All done"}
            </div>
            <h3 className="mt-2 text-[1.55rem] font-semibold tracking-tight text-zinc-50">
              You can leave it here for today.
            </h3>
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-zinc-400">
              If the day gets slippery later, support is still one tap away.
            </p>
          </article>
        ) : nextHabit ? (
          <article
            className={`grain-card relative overflow-hidden rounded-[30px] border border-white/10 px-5 py-5 shadow-[0_24px_80px_-54px_rgba(0,0,0,0.95)] transition sm:px-6 ${
              celebratingHabitId === nextHabit.id
                ? "animate-soft-pop bg-[radial-gradient(circle_at_top,#69d7ca30,transparent_55%),linear-gradient(180deg,#1a2322_0%,#121716_100%)]"
                : "bg-[radial-gradient(circle_at_top,rgba(254,44,85,0.12),transparent_36%),linear-gradient(180deg,rgba(20,20,22,0.82)_0%,rgba(12,12,14,0.82)_100%)]"
            }`}
          >
            {celebratingHabitId === nextHabit.id ? (
              <>
                <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-[#dbfff6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#176857]">
                  Done
                </div>
              </>
            ) : null}
            <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-[#ffc978]/18 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="max-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/6 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                    Start here
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      nextHabit.type === "BUILD"
                        ? "bg-[#0d2d31] text-[#7af7f2]"
                        : "bg-[#34121d] text-[#ff7d9a]"
                    }`}
                  >
                    {nextHabit.type === "BUILD" ? "Repeat" : "Loosen"}
                  </span>
                </div>
                <h4 className="mt-4 text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-zinc-50">
                  {nextHabit.name}
                </h4>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {nextHabit.minimumAction}
                </p>
                {nextHabit.type === "BREAK" ? (
                  <button
                    type="button"
                    onClick={openUrgeSupport}
                    className="pressable app-btn-quiet mt-3 min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-100"
                  >
                    Urge hitting now
                  </button>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Or choose another practice below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHabitId(nextHabit.id)}
                className="pressable app-btn-secondary flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-300"
              >
                Details
              </button>
            </div>

            <div className="relative mt-5 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <button
                type="button"
                onClick={() => completeHabit(nextHabit.id)}
                disabled={
                  nextHabit.completedToday ||
                  nextHabit.restedToday ||
                  isPending ||
                  activeMutationHabitId !== null
                }
                className={`min-h-12 flex-1 rounded-[18px] px-5 py-3 text-sm font-semibold transition ${
                  nextHabit.completedToday
                      ? "cursor-not-allowed bg-[#dcfff5] text-[#176857]"
                      : nextHabit.restedToday
                      ? "cursor-not-allowed bg-[#3b3117] text-[#facc15]"
                    : "app-btn-primary text-white hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {nextHabit.completedToday ? "Done today" : nextHabit.restedToday ? "Resting today" : "Mark as done"}
              </button>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <button
                  type="button"
                  onClick={() => restHabit(nextHabit.id)}
                  disabled={
                    nextHabit.restedToday ||
                    nextHabit.completedToday ||
                    isPending ||
                    activeMutationHabitId !== null
                  }
                  className="pressable app-btn-secondary min-h-12 rounded-[18px] px-5 py-3 text-sm font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {nextHabit.restedToday ? "Resting today" : "Rest today"}
                </button>
                <div className="flex items-center rounded-[18px] bg-white/6 px-3 py-2 text-sm text-zinc-300">
                  {Math.max(
                    habits.filter((habit) => !habit.completedToday && !habit.restedToday).length - 1,
                    0,
                  )} still open
                </div>
              </div>
            </div>
          </article>
        ) : null}

        {habits.some((habit) => habit.id !== nextHabit?.id) ? (
          <section className="grid gap-2 px-1">
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="text-sm font-semibold text-zinc-100">You can also do these</div>
              <div className="text-xs text-zinc-500">Any order</div>
            </div>
            <div className="grid gap-3">
              {habits
                .filter((habit) => habit.id !== nextHabit?.id)
                .map((habit) => {
                  const isClosed = habit.completedToday || habit.restedToday;

                  return (
                    <article
                      key={habit.id}
                    className={`rounded-[22px] border px-4 py-3 ${
                      isClosed
                          ? "border-white/8 bg-white/[0.035]"
                          : "border-white/10 bg-white/[0.055]"
                      }`}
                    >
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            habit.completedToday
                              ? "bg-[#69d7ca]"
                              : habit.restedToday
                                ? "bg-[#ffd68b]"
                                : "bg-[#f0d6de]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedHabitId(habit.id)}
                          className="min-w-0 text-left"
                        >
                              <div className="truncate text-sm font-semibold text-zinc-50">
                                {habit.name}
                              </div>
                              <div className="mt-1 truncate text-sm text-zinc-400">
                                {isClosed ? "Held for today" : habit.minimumAction}
                              </div>
                        </button>
                        {isClosed ? (
                          <div
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                              habit.completedToday
                                ? "bg-[#dcfff5] text-[#176857]"
                                : "bg-[#fff4d9] text-[#6f5415]"
                            }`}
                          >
                            {habit.completedToday ? "Done" : "Resting"}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => completeHabit(habit.id)}
                            disabled={isPending || activeMutationHabitId !== null}
                            className="pressable app-btn-primary min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Mark
                          </button>
                        )}
                      </div>

                      {!isClosed ? (
                        <button
                          type="button"
                          onClick={() => restHabit(habit.id)}
                          disabled={isPending || activeMutationHabitId !== null}
                          className="pressable app-btn-secondary mt-3 min-h-11 w-full rounded-full px-3 py-2.5 text-sm font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Rest today
                        </button>
                      ) : null}
                    </article>
                  );
                })}
            </div>
          </section>
        ) : null}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </section>

      {selectedHabit ? (
        <div className="animate-overlay-fade fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6">
          <button
            type="button"
            aria-label="Close habit details"
            onClick={() => setSelectedHabitId(null)}
            className="absolute inset-0"
          />
          <div
            className="app-card animate-sheet-rise relative z-10 max-h-[88svh] w-full overflow-y-auto rounded-t-[28px] p-5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.85)] lg:max-w-[560px] lg:rounded-[30px]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/10" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-zinc-50">{selectedHabit.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      selectedHabit.type === "BUILD"
                        ? "bg-[#0d2d31] text-[#7af7f2]"
                        : "bg-[#34121d] text-[#ff7d9a]"
                    }`}
                  >
                    {selectedHabit.type === "BUILD" ? "Repeat" : "Loosen"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Minimum step: {selectedHabit.minimumAction}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHabitId(null)}
                className="pressable app-btn-secondary min-h-11 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/4 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">All-time</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-50">
                  {selectedHabit.stats.totalCompletions}
                </div>
              </div>
              <div className="rounded-2xl bg-white/4 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">This week</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-50">
                  {selectedHabit.stats.completionsLast7Days}
                </div>
              </div>
              <div className="rounded-2xl bg-white/4 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Urges</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-50">
                  {selectedHabit.stats.totalUrges}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {selectedHabit.stats.resistedUrges} resisted, {selectedHabit.stats.actedUrges} acted
                </div>
              </div>
              <div className="rounded-2xl bg-white/4 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Avg urge</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-50">
                  {selectedHabit.stats.averageUrgeIntensity ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Last completion</div>
              <div className="mt-2 text-sm text-zinc-400">
                {selectedHabit.stats.lastCompletedAtLabel
                  ? `Marked ${selectedHabit.stats.lastCompletedAtLabel}`
                  : "No completion yet."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto flex w-full max-w-[430px] justify-center px-4">
          <div className="animate-success-toast rounded-full border border-emerald-300/20 bg-[linear-gradient(180deg,rgba(26,44,36,0.95)_0%,rgba(16,28,24,0.95)_100%)] px-4 py-3 text-sm font-medium text-emerald-100 shadow-[0_24px_70px_-32px_rgba(52,211,153,0.95)] backdrop-blur">
            {successMessage.text}
          </div>
        </div>
      ) : null}
    </>
  );
}
