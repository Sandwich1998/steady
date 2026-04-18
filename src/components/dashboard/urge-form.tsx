"use client";

import { HabitType } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

type UrgeFormProps = {
  habits: {
    id: string;
    name: string;
    type: HabitType;
  }[];
  hiddenUntilOpen?: boolean;
};

const intensities = [1, 2, 3, 4, 5];

export function UrgeForm({ habits, hiddenUntilOpen = false }: UrgeFormProps) {
  const router = useRouter();
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const [habitId, setHabitId] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [outcome, setOutcome] = useState<"RESISTED" | "ACTED">("RESISTED");
  const [isOpen, setIsOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedHabitId =
    breakHabits.find((habit) => habit.id === habitId)?.id ?? breakHabits[0]?.id ?? "";

  useEffect(() => {
    function openFromOutside() {
      setIsOpen(true);
    }

    window.addEventListener("steady:open-urge-sheet", openFromOutside as EventListener);
    return () => {
      window.removeEventListener("steady:open-urge-sheet", openFromOutside as EventListener);
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/urges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: selectedHabitId, intensity, outcome }),
    });

    if (!response.ok) {
      setError("Couldn't save this urge.");
      return;
    }

    setIntensity(3);
    setOutcome("RESISTED");
    setSavedMessage(
      outcome === "RESISTED" ? "Saved. You resisted it." : "Saved. Pick back up from here.",
    );
    window.setTimeout(() => {
      setSavedMessage("");
    }, 2200);
    setIsOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card
      title="Urge support"
      description="For the minute when the pull gets loud."
    >
      {breakHabits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/72">
          Add one practice to loosen before you log urges here.
        </p>
      ) : !isOpen ? (
        hiddenUntilOpen ? (
          savedMessage ? (
            <div className="animate-success-toast rounded-[18px] bg-[#1d3b2a] px-4 py-3 text-sm text-[#9be4b6]">
              {savedMessage}
            </div>
          ) : null
        ) : (
        <div className="app-card-soft rounded-[24px] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">The pull is here.</div>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Mark what happened, then get out of here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="pressable app-btn-primary shrink-0 rounded-full px-4 py-3 text-sm font-semibold"
            >
              Note the urge
            </button>
          </div>
          {savedMessage ? (
            <div className="animate-success-toast mt-4 rounded-[18px] bg-[rgba(121,219,198,0.14)] px-4 py-3 text-sm text-[var(--accent-mint)]">
              {savedMessage}
            </div>
          ) : null}
        </div>
        )
      ) : (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 animate-overlay-fade">
          <button
            type="button"
            aria-label="Close urge sheet"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0"
          />
          <form
            className="app-card animate-sheet-rise relative z-10 w-full rounded-t-[34px] p-5 shadow-[0_-30px_80px_-30px_rgba(7,16,20,0.95)]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onSubmit={handleSubmit}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[15rem]">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9bb0ff]">
                  Urge support
                </div>
                <div className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-tight text-white">
                  Mark the pull.
                </div>
                <div className="mt-3 text-sm leading-6 text-white/70">
                  Pick the habit, mark the pull, say what happened.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="pressable min-h-11 rounded-full bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/78"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-white/78" htmlFor="urge-habit">
                  Which habit is tugging right now?
                </label>
                <select
                  id="urge-habit"
                  value={selectedHabitId}
                  onChange={(event) => setHabitId(event.target.value)}
                  className="app-field rounded-[20px] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
                >
                  {breakHabits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-white/78">How strong is it?</span>
                <div className="grid grid-cols-5 gap-2">
                  {intensities.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIntensity(value)}
                      className={`pressable min-h-11 rounded-[18px] border px-3 py-3 text-sm font-semibold ${
                        value === intensity
                          ? "border-[var(--accent-mint)] bg-[rgba(121,219,198,0.18)] text-white shadow-[0_12px_30px_-18px_rgba(121,219,198,0.5)]"
                          : "border-white/8 bg-white/[0.04] text-white/80 hover:border-white/15"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-white/78">What happened?</span>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setOutcome("RESISTED")}
                    className={`pressable min-h-11 rounded-[22px] border px-4 py-4 text-left ${
                      outcome === "RESISTED"
                        ? "border-[var(--accent-mint)] bg-[rgba(121,219,198,0.16)] text-white shadow-[0_12px_30px_-20px_rgba(121,219,198,0.42)]"
                        : "border-white/8 bg-white/[0.04] text-white/80 hover:border-white/15"
                    }`}
                  >
                      <div className="text-base font-semibold">I resisted it</div>
                      <div className="mt-1 text-sm text-white/70">
                      I interrupted it, even if it was messy.
                      </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("ACTED")}
                    className={`pressable min-h-11 rounded-[22px] border px-4 py-4 text-left ${
                      outcome === "ACTED"
                        ? "border-[var(--accent-rose)] bg-[rgba(255,171,157,0.14)] text-white shadow-[0_12px_30px_-20px_rgba(255,171,157,0.34)]"
                        : "border-white/8 bg-white/[0.04] text-white/80 hover:border-white/15"
                    }`}
                  >
                      <div className="text-base font-semibold">I acted on it</div>
                      <div className="mt-1 text-sm text-white/70">
                      I gave way. Mark it and keep going.
                      </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedHabitId || isPending}
              className="pressable app-btn-primary mt-5 min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save note
            </button>
            {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
          </form>
        </div>
      )}
    </Card>
  );
}
