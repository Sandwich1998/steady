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
      setError("Unable to log the urge.");
      return;
    }

    setIntensity(3);
    setOutcome("RESISTED");
    setSavedMessage(outcome === "RESISTED" ? "Urge logged. You held the line." : "Urge logged. Start again from here.");
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
      title="Hold the moment"
      description="Use this only when you need it. Log the moment quickly, then let it pass."
    >
      {breakHabits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/72">
          Create one habit you want to loosen before you start logging urges.
        </p>
      ) : !isOpen ? (
        hiddenUntilOpen ? (
          savedMessage ? (
            <div className="animate-success-toast rounded-[18px] bg-[#1d3b2a] px-4 py-3 text-sm text-[#9be4b6]">
              {savedMessage}
            </div>
          ) : null
        ) : (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Need a steadying pause?</div>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Name what is happening, mark what happened, and get back to your day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="pressable shrink-0 rounded-full bg-[#3554d1] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-22px_rgba(69,101,235,0.95)] hover:bg-[#4565eb]"
            >
              I feel an urge
            </button>
          </div>
          {savedMessage ? (
            <div className="animate-success-toast mt-4 rounded-[18px] bg-[#1d3b2a] px-4 py-3 text-sm text-[#9be4b6]">
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
            className="animate-sheet-rise relative z-10 w-full rounded-t-[34px] border border-white/8 bg-[#17171a] p-5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.95)]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onSubmit={handleSubmit}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/15" />
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[15rem]">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9bb0ff]">
                  Steady support
                </div>
                <div className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-tight text-white">
                  Stay with yourself for one breath.
                </div>
                <div className="mt-3 text-sm leading-6 text-white/70">
                  Name the pull, choose the honest outcome, then let the moment move through.
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
                  Which loop is calling right now?
                </label>
                <select
                  id="urge-habit"
                  value={selectedHabitId}
                  onChange={(event) => setHabitId(event.target.value)}
                  className="min-h-11 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
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
                          ? "border-[#3554d1] bg-[#3554d1] text-white shadow-[0_12px_30px_-18px_rgba(69,101,235,1)]"
                          : "border-white/8 bg-white/[0.03] text-white/80 hover:border-white/15"
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
                        ? "border-[#2f7c59] bg-[#214635] text-white shadow-[0_12px_30px_-20px_rgba(47,124,89,1)]"
                        : "border-white/8 bg-white/[0.03] text-white/80 hover:border-white/15"
                    }`}
                  >
                      <div className="text-base font-semibold">I resisted it</div>
                      <div className="mt-1 text-sm text-white/70">
                      I interrupted the pull, even if it felt messy.
                      </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("ACTED")}
                    className={`pressable min-h-11 rounded-[22px] border px-4 py-4 text-left ${
                      outcome === "ACTED"
                        ? "border-[#85384a] bg-[#4c2631] text-white shadow-[0_12px_30px_-20px_rgba(133,56,74,1)]"
                        : "border-white/8 bg-white/[0.03] text-white/80 hover:border-white/15"
                    }`}
                  >
                      <div className="text-base font-semibold">I acted on it</div>
                      <div className="mt-1 text-sm text-white/70">
                      No shame. Log it honestly and keep moving.
                      </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedHabitId || isPending}
              className="pressable mt-5 min-h-11 w-full rounded-full bg-[#3554d1] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(69,101,235,1)] hover:bg-[#4565eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save this moment
            </button>
            {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
          </form>
        </div>
      )}
    </Card>
  );
}
