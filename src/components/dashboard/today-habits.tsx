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
  const [dragXById, setDragXById] = useState<Record<string, number>>({});
  const [dragStartXById, setDragStartXById] = useState<Record<string, number>>({});
  const [draggingHabitId, setDraggingHabitId] = useState<string | null>(null);
  const [swipedOpenId, setSwipedOpenId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ habitId: string; text: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? null;
  const nextHabit = habits.find((habit) => !habit.completedToday) ?? habits[0] ?? null;
  const queueHabits = habits.filter((habit) => habit.id !== nextHabit?.id);

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
    setError("");

    const response = await fetch(`/api/habits/${habitId}/complete`, {
      method: "POST",
    });

    if (!response.ok) {
      setError("Couldn't save that hold.");
      return;
    }

    setCelebratingHabitId(habitId);
    const habit = habits.find((currentHabit) => currentHabit.id === habitId);
    setSuccessMessage({
      habitId,
      text: habit?.completedToday
        ? `${habit.name} was already held.`
        : `Held: ${habit?.name ?? "That practice"}.`,
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
  }

  function startSwipe(habitId: string, clientX: number) {
    setDraggingHabitId(habitId);
    setSwipedOpenId((current) => (current === habitId ? current : null));
    setDragStartXById((current) => ({ ...current, [habitId]: clientX }));
  }

  function moveSwipe(habitId: string, clientX: number) {
    const startX = dragStartXById[habitId];
    if (startX === undefined) return;
    const delta = clientX - startX;
    const next = Math.max(Math.min(delta, 0), -108);
    setDragXById((current) => ({ ...current, [habitId]: next }));
  }

  function endSwipe(habitId: string) {
    const currentX = dragXById[habitId] ?? 0;
    const open = currentX <= -52;
    setDraggingHabitId(null);
    setSwipedOpenId(open ? habitId : null);
    setDragXById((current) => ({ ...current, [habitId]: open ? -108 : 0 }));
    setDragStartXById((current) => {
      const next = { ...current };
      delete next[habitId];
      return next;
    });
  }

  if (habits.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-5">
        <div className="text-base font-semibold text-white">No practice yet</div>
        <p className="mt-2 text-sm leading-6 text-white/68">
          Add one practice and this screen starts to work.
        </p>
      </section>
    );
  }

  return (
    <>
      <section id="today-habits" className="grid gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/52">
              Next hold
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {nextHabit?.completedToday ? "Today's list is settled." : "One thing, then you're clear."}
            </h3>
          </div>
          <div className="rounded-full bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-white/72">
            {habits.filter((habit) => habit.completedToday).length}/{habits.length} complete
          </div>
        </div>

        {nextHabit ? (
          <article
            className={`relative overflow-hidden rounded-[30px] border px-5 py-5 transition ${
              celebratingHabitId === nextHabit.id
                ? "animate-soft-pop border-emerald-300/40 bg-[radial-gradient(circle_at_top,#34d39933,transparent_55%),linear-gradient(180deg,#14251f_0%,#151515_100%)] shadow-[0_25px_70px_-36px_rgba(52,211,153,0.9)]"
                : nextHabit.completedToday
                  ? "border-white/8 bg-[linear-gradient(180deg,#1b231d_0%,#151515_100%)]"
                  : "border-white/8 bg-[radial-gradient(circle_at_top,#7c6cff2e,transparent_45%),linear-gradient(180deg,#18172a_0%,#151515_100%)] shadow-[0_28px_80px_-42px_rgba(124,108,255,0.8)]"
            }`}
          >
            {celebratingHabitId === nextHabit.id ? (
              <>
                <div className="animate-success-burst pointer-events-none absolute inset-0 rounded-[30px] border border-emerald-300/35" />
                <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  Win locked
                </div>
              </>
            ) : null}
            <div className="pointer-events-none absolute -right-6 top-0 h-24 w-24 rounded-full bg-[#7c6cff]/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="max-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      nextHabit.type === "BUILD"
                        ? "bg-[#24345f] text-[#adc0ff]"
                        : "bg-[#432229] text-[#f5a0af]"
                    }`}
                  >
                    {nextHabit.type === "BUILD" ? "Build" : "Break"}
                  </span>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/70">
                    {nextHabit.completedToday ? "Held" : "On deck"}
                  </span>
                </div>
                <h4 className="mt-4 text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-white">
                  {nextHabit.name}
                </h4>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {nextHabit.minimumAction}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHabitId(nextHabit.id)}
                className="flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/80"
              >
                View
              </button>
            </div>

            <div className="relative mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => completeHabit(nextHabit.id)}
                disabled={nextHabit.completedToday || isPending}
                className={`min-h-11 flex-1 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  nextHabit.completedToday
                    ? "cursor-not-allowed bg-[#1d3b2a] text-[#72d397]"
                    : "bg-[#3554d1] text-white shadow-[0_16px_42px_-24px_rgba(69,101,235,1)] hover:scale-[1.01] hover:bg-[#4565eb] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {nextHabit.completedToday ? "Held today" : "Mark held"}
              </button>
              <div className="rounded-full bg-white/[0.05] px-3 py-2 text-sm text-white/72">
                {nextHabit.type === "BUILD" ? "To repeat" : "To loosen"}
              </div>
            </div>
          </article>
        ) : null}

        {queueHabits.length > 0 ? (
          <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">Later today</div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/42">
                Swipe
              </div>
            </div>
            <div className="mt-3 grid gap-3">
              {queueHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`relative overflow-hidden rounded-[22px] border bg-[#191919] transition-shadow ${
                    swipedOpenId === habit.id
                      ? "border-[#3554d1]/45 shadow-[0_18px_50px_-34px_rgba(69,101,235,0.95)]"
                      : "border-white/8"
                  }`}
                >
                  <div className="absolute inset-y-0 right-0 flex items-center gap-2 px-3">
                    <button
                      type="button"
                      onClick={() => completeHabit(habit.id)}
                      disabled={habit.completedToday || isPending}
                      className="min-h-11 rounded-full bg-[#214635] px-4 py-2.5 text-sm font-semibold text-[#9be4b6] disabled:opacity-60"
                    >
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHabitId(habit.id)}
                      className="min-h-11 rounded-full bg-[#24345f] px-4 py-2.5 text-sm font-semibold text-[#adc0ff]"
                    >
                      View
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if ((dragXById[habit.id] ?? 0) < -8 || swipedOpenId === habit.id) return;
                      setSelectedHabitId(habit.id);
                    }}
                    onPointerDown={(event) => startSwipe(habit.id, event.clientX)}
                    onPointerMove={(event) => moveSwipe(habit.id, event.clientX)}
                    onPointerUp={() => endSwipe(habit.id)}
                    onPointerCancel={() => endSwipe(habit.id)}
                    className={`relative flex min-h-11 w-full items-center justify-between gap-3 bg-[#191919] px-4 py-3 text-left will-change-transform ${
                      draggingHabitId === habit.id
                        ? ""
                        : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    }`}
                    style={{
                      transform: `translateX(${dragXById[habit.id] ?? (swipedOpenId === habit.id ? -108 : 0)}px)`,
                      touchAction: "pan-y",
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{habit.name}</div>
                      <div className="mt-1 text-sm text-white/62">
                        {habit.completedToday ? "Held already" : habit.minimumAction}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {swipedOpenId === habit.id ? (
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">
                          Release
                        </div>
                      ) : null}
                      <div
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          habit.completedToday ? "bg-emerald-400" : "bg-white/28"
                        }`}
                      />
                      <div className="text-base text-white/36">›</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </section>

      {selectedHabit ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <button
            type="button"
            aria-label="Close habit details"
            onClick={() => setSelectedHabitId(null)}
            className="absolute inset-0"
          />
          <div
            className="relative z-10 w-full rounded-t-[34px] border border-white/8 bg-[#1a1a1a] p-5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.95)]"
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
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Minimum step: {selectedHabit.minimumAction}
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
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">All-time holds</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.totalCompletions}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">This week</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.completionsLast7Days}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Urge moments</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.totalUrges}
                </div>
                <div className="mt-1 text-xs text-white/70">
                  {selectedHabit.stats.resistedUrges} resisted, {selectedHabit.stats.actedUrges} acted
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Avg urge</div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {selectedHabit.stats.averageUrgeIntensity ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Last hold</div>
              <div className="mt-2 text-sm text-white/72">
                {selectedHabit.stats.lastCompletedAtLabel
                  ? `Marked ${selectedHabit.stats.lastCompletedAtLabel}`
                  : "No hold yet."}
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
