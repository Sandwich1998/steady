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
const interruptionSteps = ["Stand up", "Leave the room", "Drink water", "Do 10 slow breaths"];
const replacements = ["Walk outside", "Shower", "Text someone", "Tea", "Gym", "Non-triggering show"];

export function UrgeForm({ habits, hiddenUntilOpen = false }: UrgeFormProps) {
  const router = useRouter();
  const breakHabits = habits.filter((habit) => habit.type === "BREAK");
  const [habitId, setHabitId] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [outcome, setOutcome] = useState<"RESISTED" | "ACTED">("RESISTED");
  const [isOpen, setIsOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [delayStarted, setDelayStarted] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(10 * 60);
  const [isPending, startTransition] = useTransition();
  const selectedHabitId =
    breakHabits.find((habit) => habit.id === habitId)?.id ?? breakHabits[0]?.id ?? "";

  useEffect(() => {
    function openFromOutside() {
      setIsOpen(true);
      setDelayStarted(false);
      setDelaySeconds(10 * 60);
    }

    window.addEventListener("steady:open-urge-sheet", openFromOutside as EventListener);
    return () => {
      window.removeEventListener("steady:open-urge-sheet", openFromOutside as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !delayStarted || delaySeconds <= 0) return;

    const interval = window.setInterval(() => {
      setDelaySeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [delaySeconds, delayStarted, isOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setError("");
    setIsSaving(true);

    try {
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
        outcome === "RESISTED"
          ? "Saved. You interrupted the pattern."
          : "Saved. One moment is not the whole day.",
      );
      window.setTimeout(() => {
        setSavedMessage("");
      }, 2200);
      setIsOpen(false);
      setDelayStarted(false);
      setDelaySeconds(10 * 60);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Couldn't save this urge.");
    } finally {
      setIsSaving(false);
    }
  }

  if (hiddenUntilOpen && !isOpen && !savedMessage) {
    return null;
  }

  return (
    <Card
      title="Support for hard moments"
      description="For the minute when the pull gets loud."
    >
      {breakHabits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-zinc-400">
          Add one loosen practice before you use this.
        </p>
      ) : !isOpen ? (
        hiddenUntilOpen ? (
          savedMessage ? (
            <div className="animate-success-toast rounded-[18px] bg-[#0d2d31] px-4 py-3 text-sm text-[#7af7f2]">
              {savedMessage}
            </div>
          ) : null
        ) : (
        <div className="app-card-soft rounded-[24px] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-50">The pull is here.</div>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Mark what happened, then get out of here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              disabled={isSaving}
            className="pressable app-btn-primary shrink-0 rounded-full px-4 py-3 text-sm font-semibold"
            >
              Urge hitting now
            </button>
          </div>
          {savedMessage ? (
            <div className="animate-success-toast mt-4 rounded-[18px] bg-[#0d2d31] px-4 py-3 text-sm text-[#7af7f2]">
              {savedMessage}
            </div>
          ) : null}
        </div>
        )
      ) : (
        <div className="animate-overlay-fade fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm lg:items-center lg:justify-center lg:p-6">
          <button
            type="button"
            aria-label="Close urge sheet"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0"
          />
          <form
            className="app-card animate-sheet-rise relative z-10 max-h-[92svh] w-full overflow-y-auto rounded-t-[34px] p-5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.85)] lg:max-w-[640px] lg:rounded-[34px]"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onSubmit={handleSubmit}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/10" />
            <div className="flex items-start justify-between gap-3">
              <div className="max-w-[15rem]">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Urge support
                </div>
                <div className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-tight text-zinc-50">
                  Delay it first.
                </div>
                <div className="mt-3 text-sm leading-6 text-zinc-400">
                  You can decide later. For 10 minutes, just move and change the scene.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="pressable app-btn-secondary min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <section className="rounded-[26px] border border-white/8 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-50">10-minute rule</div>
                    <div className="mt-1 text-sm text-zinc-400">
                      I can do it, but not right now.
                    </div>
                  </div>
                  <div className="rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-zinc-100">
                    {Math.floor(delaySeconds / 60)}:{String(delaySeconds % 60).padStart(2, "0")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDelayStarted(true)}
                  disabled={delayStarted}
                  className="pressable app-btn-primary mt-4 min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {delayStarted ? "Timer running. Move now." : "Start 10-minute delay"}
                </button>
              </section>

              <section className="grid gap-3 rounded-[26px] border border-white/8 bg-white/[0.045] p-4">
                <div className="text-sm font-semibold text-zinc-50">Do this now</div>
                <div className="grid grid-cols-2 gap-2">
                  {interruptionSteps.map((step) => (
                    <div key={step} className="rounded-[18px] bg-white/[0.055] px-3 py-3 text-sm font-medium text-zinc-300">
                      {step}
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3">
                <div className="text-sm font-medium text-zinc-300">Replacement if the pull stays loud</div>
                <div className="flex flex-wrap gap-2">
                  {replacements.map((replacement) => (
                    <span key={replacement} className="rounded-full bg-white/7 px-3 py-2 text-sm text-zinc-300">
                      {replacement}
                    </span>
                  ))}
                </div>
              </section>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="urge-habit">
                  Which pattern is tugging?
                </label>
                <select
                  id="urge-habit"
                  value={selectedHabitId}
                  onChange={(event) => setHabitId(event.target.value)}
                  disabled={isSaving}
                  className="app-field rounded-[20px] px-4 py-3 text-sm outline-none transition focus:border-[#25f4ee]"
                >
                  {breakHabits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-zinc-300">How strong is it?</span>
                <div className="grid grid-cols-5 gap-2">
                  {intensities.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIntensity(value)}
                      disabled={isSaving}
                      className={`pressable min-h-11 rounded-[18px] border px-3 py-3 text-sm font-semibold ${
                        value === intensity
                          ? "border-[#25f4ee] bg-[#0d2d31] text-zinc-50 shadow-[0_12px_30px_-18px_rgba(37,244,238,0.24)]"
                          : "border-white/8 bg-white/5 text-zinc-300 hover:border-white/12"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-zinc-300">What happened?</span>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setOutcome("RESISTED")}
                    disabled={isSaving}
                    className={`pressable min-h-11 rounded-[22px] border px-4 py-4 text-left ${
                      outcome === "RESISTED"
                        ? "border-[#25f4ee] bg-[#0d2d31] text-zinc-50 shadow-[0_12px_30px_-20px_rgba(37,244,238,0.24)]"
                        : "border-white/8 bg-white/5 text-zinc-300 hover:border-white/12"
                    }`}
                  >
                    <div className="text-base font-semibold">I delayed or redirected it</div>
                    <div className="mt-1 text-sm text-zinc-400">
                      I interrupted the pattern, even if it was messy.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("ACTED")}
                    disabled={isSaving}
                    className={`pressable min-h-11 rounded-[22px] border px-4 py-4 text-left ${
                      outcome === "ACTED"
                        ? "border-[#fe2c55] bg-[#34121d] text-zinc-50 shadow-[0_12px_30px_-20px_rgba(254,44,85,0.22)]"
                        : "border-white/8 bg-white/5 text-zinc-300 hover:border-white/12"
                    }`}
                  >
                    <div className="text-base font-semibold">I slipped</div>
                    <div className="mt-1 text-sm text-zinc-400">
                      Mark it without shame. Then take one next step.
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedHabitId || isPending || isSaving}
              className="pressable app-btn-primary mt-5 min-h-11 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {outcome === "RESISTED" ? "Save interruption" : "Save and restart"}
            </button>
            {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
          </form>
        </div>
      )}
    </Card>
  );
}
