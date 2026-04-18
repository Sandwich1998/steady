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
  const completedCount = habits.filter((habit) => habit.completedToday).length;
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? null;
  const nextHabit = habits.find((habit) => !habit.completedToday) ?? habits[0] ?? null;
  const queueHabits = habits.filter(
    (habit) => !habit.completedToday && habit.id !== nextHabit?.id,
  );
  const allHeld = habits.length > 0 && completedCount === habits.length;

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
      <section className="rounded-[28px] border border-dashed border-[#ecd9df] bg-white/70 p-5">
        <div className="text-base font-semibold text-slate-950">No practice yet</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add one practice and this screen starts to work.
        </p>
      </section>
    );
  }

  return (
    <>
      <section id="today-habits" className="grid gap-4">
        {allHeld ? (
          <article className="rounded-[30px] border border-[#ecd9df] bg-white/74 px-5 py-5 shadow-[0_18px_40px_-30px_rgba(214,173,183,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              All held
            </div>
            <h3 className="mt-2 text-[1.55rem] font-semibold tracking-tight text-slate-950">
              Nothing else needs doing here.
            </h3>
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">
              If the day turns slippery later, urge help is still one tap away.
            </p>
          </article>
        ) : nextHabit ? (
          <article
            className={`relative overflow-hidden rounded-[30px] border px-5 py-5 transition ${
              celebratingHabitId === nextHabit.id
                ? "animate-soft-pop border-[#9be4b6] bg-[radial-gradient(circle_at_top,#69d7ca30,transparent_55%),linear-gradient(180deg,#ffffff_0%,#fff4f7_100%)] shadow-[0_24px_70px_-38px_rgba(105,215,202,0.55)]"
                : "border-[#ecd9df] bg-[radial-gradient(circle_at_top,#b8a6ff22,transparent_40%),linear-gradient(180deg,#ffffff_0%,#fff4f7_100%)] shadow-[0_24px_70px_-42px_rgba(214,173,183,0.28)]"
            }`}
          >
            {celebratingHabitId === nextHabit.id ? (
              <>
                <div className="animate-success-burst pointer-events-none absolute inset-0 rounded-[30px] border border-emerald-300/35" />
                <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-[#dbfff6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2f8f7d]">
                  Held
                </div>
              </>
            ) : null}
            <div className="pointer-events-none absolute -right-6 top-0 h-24 w-24 rounded-full bg-[#ffc978]/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="max-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#fff2f6] px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Right now
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      nextHabit.type === "BUILD"
                        ? "bg-[#ebf6ff] text-[#3c78a3]"
                        : "bg-[#fff0f1] text-[#c86f7c]"
                    }`}
                  >
                    {nextHabit.type === "BUILD" ? "Repeat" : "Loosen"}
                  </span>
                </div>
                <h4 className="mt-4 text-[1.7rem] font-semibold leading-[1.05] tracking-tight text-slate-950">
                  {nextHabit.name}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {nextHabit.minimumAction}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHabitId(nextHabit.id)}
                className="flex h-11 min-w-11 items-center justify-center rounded-full border border-[#ecd9df] bg-white/85 px-4 text-sm font-medium text-slate-700"
              >
                Details
              </button>
            </div>

            <div className="relative mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => completeHabit(nextHabit.id)}
                disabled={nextHabit.completedToday || isPending}
                className={`min-h-11 flex-1 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  nextHabit.completedToday
                    ? "cursor-not-allowed bg-[#dcfff5] text-[#2f8f7d]"
                    : "bg-[linear-gradient(180deg,#8be6dc_0%,#6cc8f4_100%)] text-slate-900 shadow-[0_16px_42px_-24px_rgba(109,201,238,0.45)] hover:scale-[1.01] hover:brightness-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {nextHabit.completedToday ? "Held today" : "Hold this"}
              </button>
              <div className="rounded-full bg-[#fff2f6] px-3 py-2 text-sm text-slate-600">
                {queueHabits.length} more after this
              </div>
            </div>
          </article>
        ) : null}

        {queueHabits.length > 0 ? (
          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="text-sm font-semibold text-slate-900">Still there</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Swipe</div>
            </div>
            <div className="grid gap-3">
              {queueHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`relative overflow-hidden rounded-[22px] border bg-white/80 transition-shadow ${
                    swipedOpenId === habit.id
                      ? "border-[#6cc8f4] shadow-[0_18px_50px_-34px_rgba(109,201,238,0.45)]"
                      : "border-[#ecd9df]"
                  }`}
                >
                  <div className="absolute inset-y-0 right-0 flex items-center gap-2 px-3">
                    <button
                      type="button"
                      onClick={() => completeHabit(habit.id)}
                      disabled={habit.completedToday || isPending}
                      className="min-h-11 rounded-full bg-[#dcfff5] px-4 py-2.5 text-sm font-semibold text-[#2f8f7d] disabled:opacity-60"
                    >
                      Hold
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedHabitId(habit.id)}
                      className="min-h-11 rounded-full bg-[#ebf6ff] px-4 py-2.5 text-sm font-semibold text-[#3c78a3]"
                    >
                      Details
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
                    className={`relative flex min-h-11 w-full items-center justify-between gap-3 bg-transparent px-4 py-3 text-left will-change-transform ${
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
                      <div className="text-sm font-semibold text-slate-950">{habit.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {habit.completedToday ? "Held already" : habit.minimumAction}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {swipedOpenId === habit.id ? (
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                          Release
                        </div>
                      ) : null}
                      <div
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          habit.completedToday ? "bg-[#69d7ca]" : "bg-[#f0d6de]"
                        }`}
                      />
                      <div className="text-base text-slate-400">›</div>
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
