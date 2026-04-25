"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

type DayResetCardProps = {
  currentMood: number | null;
  startedAt: string | null;
  startedAtLabel: string | null;
};

const moods = [
  {
    value: 1,
    label: "Very low",
    hint: "Red flag day",
    dot: "bg-[#ff4d6d]",
    activeClass: "border-[#ff4d6d]/80 bg-[#ff4d6d]/8 text-zinc-50 shadow-[0_14px_32px_-22px_rgba(255,77,109,0.28)]",
  },
  {
    value: 2,
    label: "Low",
    hint: "Not feeling great",
    dot: "bg-[#ff8a3d]",
    activeClass: "border-[#ff8a3d]/80 bg-[#ff8a3d]/8 text-zinc-50 shadow-[0_14px_32px_-22px_rgba(255,138,61,0.24)]",
  },
  {
    value: 3,
    label: "Okay",
    hint: "Neutral and manageable",
    dot: "bg-[#ffd166]",
    activeClass: "border-[#ffd166]/80 bg-[#ffd166]/10 text-zinc-50 shadow-[0_14px_32px_-22px_rgba(255,209,102,0.22)]",
  },
  {
    value: 4,
    label: "Good",
    hint: "Feeling fairly solid",
    dot: "bg-[#7ee081]",
    activeClass: "border-[#7ee081]/80 bg-[#7ee081]/8 text-zinc-50 shadow-[0_14px_32px_-22px_rgba(126,224,129,0.22)]",
  },
  {
    value: 5,
    label: "Great",
    hint: "Strong and clear",
    dot: "bg-[#2dd4bf]",
    activeClass: "border-[#2dd4bf]/80 bg-[#2dd4bf]/8 text-zinc-50 shadow-[0_14px_32px_-22px_rgba(45,212,191,0.24)]",
  },
] as const;

export function DayResetCard({
  currentMood,
  startedAt,
  startedAtLabel,
}: DayResetCardProps) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(currentMood ?? 3);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const selectedMoodOption = moods.find((mood) => mood.value === selectedMood) ?? moods[2];
  const dayStarted = currentMood !== null;

  async function startDay() {
    if (isSaving) return;
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/day-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood }),
      });

      if (!response.ok) {
        setError("Couldn't save your check-in.");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Couldn't save your check-in.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div id="daily-reset">
      <Card
        title="Morning check-in"
        description="Pick the closest mood, then give the next few hours a simple shape."
        action={
          currentMood ? (
            <div className="rounded-full bg-[#dcfff5] px-3 py-1 text-sm font-medium text-[#176857]">
              Done
            </div>
          ) : null
        }
      >
        <div className="px-1 py-1">
        <div className="app-card-soft rounded-[24px] p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Mood
            </div>
            <div className="mt-2 text-xl font-semibold text-zinc-50">
              {selectedMoodOption.label}
            </div>
            <div className="mt-1 text-sm text-zinc-400">{selectedMoodOption.hint}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Level
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-50">{selectedMood}/5</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[linear-gradient(90deg,#ff4d6d_0%,#ff8a3d_25%,#ffd166_50%,#7ee081_75%,#2dd4bf_100%)]" />
        <div className="mt-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          <span>Low</span>
          <span>High</span>
        </div>
        </div>
      </div>

      {dayStarted ? (
        <div className="px-1 py-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Today&apos;s mood
              </div>
              <div className="mt-2 text-base font-semibold text-zinc-50">{selectedMoodOption.label}</div>
              <div className="mt-1 text-sm text-zinc-400">{selectedMoodOption.hint}</div>
            </div>
            <div className={`mt-1 h-3 w-3 rounded-full ${selectedMoodOption.dot}`} />
          </div>
        </div>
      ) : (
        <>
          <div className="px-1 py-2">
            <div className="text-sm font-semibold text-zinc-50">First 30 minutes</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Water", "No scrolling", "Move a little", "Eat something real"].map((step) => (
                <div key={step} className="rounded-[16px] bg-white/[0.045] px-3 py-2.5 text-sm text-zinc-300">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const active = mood.value === selectedMood;

              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  disabled={isSaving}
                  aria-pressed={active}
                  className={`min-h-[4.5rem] rounded-[14px] border px-2.5 py-3 text-center transition ${
                    active
                      ? mood.activeClass
                      : "border-white/8 bg-white/5 text-zinc-300 hover:border-white/12 hover:bg-white/8"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${mood.dot}`} />
                    <div className="text-[11px] font-semibold leading-tight">{mood.label}</div>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    {mood.value}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-400">
          {startedAt
            ? `Checked in ${startedAtLabel}.`
            : "No check-in today yet."}
        </div>
        <button
          type="button"
          onClick={startDay}
          disabled={isPending || isSaving || dayStarted}
          className="pressable app-btn-primary min-h-12 rounded-[16px] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dayStarted ? "Done" : "Start the day"}
        </button>
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </Card>
    </div>
  );
}
