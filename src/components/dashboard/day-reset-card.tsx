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
    label: "Drained",
    hint: "Very low energy",
    dot: "bg-rose-400",
    activeClass: "border-rose-400/60 bg-rose-500/18 text-white shadow-[0_10px_30px_-18px_rgba(251,113,133,0.8)]",
  },
  {
    value: 2,
    label: "Off",
    hint: "A bit flat",
    dot: "bg-orange-400",
    activeClass: "border-orange-400/60 bg-orange-500/18 text-white shadow-[0_10px_30px_-18px_rgba(251,146,60,0.75)]",
  },
  {
    value: 3,
    label: "Steady",
    hint: "Neutral and stable",
    dot: "bg-amber-300",
    activeClass: "border-amber-300/60 bg-amber-400/18 text-white shadow-[0_10px_30px_-18px_rgba(252,211,77,0.65)]",
  },
  {
    value: 4,
    label: "Good",
    hint: "Clear and positive",
    dot: "bg-lime-400",
    activeClass: "border-lime-400/60 bg-lime-500/18 text-white shadow-[0_10px_30px_-18px_rgba(163,230,53,0.7)]",
  },
  {
    value: 5,
    label: "Great",
    hint: "Strong and ready",
    dot: "bg-emerald-400",
    activeClass: "border-emerald-400/60 bg-emerald-500/18 text-white shadow-[0_10px_30px_-18px_rgba(52,211,153,0.75)]",
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
        description="Pick the closest mood and begin from there."
        action={
          currentMood ? (
            <div className="rounded-full bg-[#dcfff5] px-3 py-1 text-sm font-medium text-[#2f8f7d]">
              Done
            </div>
          ) : null
        }
      >
        <div className="app-card-soft rounded-[24px] p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Mood
            </div>
            <div className="mt-2 text-xl font-semibold text-slate-950">
              {selectedMoodOption.label}
            </div>
            <div className="mt-1 text-sm text-slate-600">{selectedMoodOption.hint}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Level
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{selectedMood}/5</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[linear-gradient(90deg,rgba(255,171,157,0.9)_0%,rgba(255,200,155,0.92)_38%,rgba(184,179,255,0.9)_72%,rgba(121,219,198,0.92)_100%)]" />
        <div className="mt-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {dayStarted ? (
        <div className="app-card-soft rounded-[24px] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Today&apos;s mood
              </div>
              <div className="mt-2 text-base font-semibold text-slate-950">{selectedMoodOption.label}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedMoodOption.hint}</div>
            </div>
            <div className={`mt-1 h-3 w-3 rounded-full ${selectedMoodOption.dot}`} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {moods.map((mood) => {
            const active = mood.value === selectedMood;

            return (
              <button
                key={mood.value}
                type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  disabled={isSaving}
                aria-pressed={active}
                className={`rounded-[24px] border px-4 py-4 text-left transition ${
                  active
                    ? mood.activeClass
                    : "border-[#ecd9df] bg-white/86 text-slate-700 hover:border-[#e4c7d0] hover:bg-[#fff8fb]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{mood.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{mood.hint}</div>
                  </div>
                  <div className={`mt-0.5 h-3 w-3 rounded-full ${mood.dot}`} />
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {mood.value}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          {startedAt
            ? `Checked in ${startedAtLabel}.`
            : "No check-in today yet."}
        </div>
        <button
          type="button"
          onClick={startDay}
          disabled={isPending || isSaving || dayStarted}
          className="pressable app-btn-primary rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dayStarted ? "Done" : "Start the day"}
        </button>
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </Card>
    </div>
  );
}
