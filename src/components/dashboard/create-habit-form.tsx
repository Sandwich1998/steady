"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import {
  HABIT_MINIMUM_ACTION_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
} from "@/lib/validation";

const resetTemplates = [
  {
    name: "Water on wake",
    minimumAction: "Drink a glass of water before checking your phone",
    type: "BUILD",
  },
  {
    name: "No phone first 30 min",
    minimumAction: "Charge phone away from bed and start without scrolling",
    type: "BUILD",
  },
  {
    name: "Morning walk",
    minimumAction: "Put on shoes and walk for 5 minutes",
    type: "BUILD",
  },
  {
    name: "Eat a real meal",
    minimumAction: "Eat protein or a simple meal before cravings build",
    type: "BUILD",
  },
  {
    name: "Porn or masturbation urge",
    minimumAction: "Delay 10 minutes, leave the room, and put phone away",
    type: "BREAK",
  },
  {
    name: "Evening weed craving",
    minimumAction: "Walk, shower, tea, or text someone before deciding",
    type: "BREAK",
  },
  {
    name: "Sugar craving",
    minimumAction: "Drink water and eat a real meal first",
    type: "BREAK",
  },
  {
    name: "No scrolling in bed",
    minimumAction: "Put phone across the room before lights down",
    type: "BREAK",
  },
] as const;

export function CreateHabitForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [minimumAction, setMinimumAction] = useState("");
  const [type, setType] = useState<"BUILD" | "BREAK">("BUILD");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, minimumAction, type }),
      });

      if (!response.ok) {
        setError("Couldn't save this practice.");
        return;
      }

      setName("");
      setMinimumAction("");
      setType("BUILD");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Couldn't save this practice.");
    } finally {
      setIsSaving(false);
    }
  }

  function applyTemplate(template: (typeof resetTemplates)[number]) {
    setName(template.name);
    setMinimumAction(template.minimumAction);
    setType(template.type);
  }

  return (
    <Card
      title="New practice"
      description="Choose something to return to more often, or something to interrupt earlier."
      variant="soft"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <section className="grid gap-3 rounded-[24px] bg-white/62 p-4">
          <div>
            <div className="text-sm font-semibold text-slate-950">7-day reset starters</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Tap one, adjust if needed, then save.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {resetTemplates.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => applyTemplate(template)}
                disabled={isSaving}
                className="pressable min-h-11 rounded-[20px] border border-[#ecd9df] bg-white/86 px-3 py-3 text-left text-sm text-slate-700"
              >
                <div className="font-semibold text-slate-950">{template.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {template.type === "BUILD" ? "Repeat" : "Loosen"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="habit-name">
            Name
          </label>
          <input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Morning walk"
            maxLength={HABIT_NAME_MAX_LENGTH}
            className="app-field rounded-2xl px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e6c7d3]"
            required
          />
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Direction</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("BUILD")}
              disabled={isSaving}
              className={`pressable min-h-11 rounded-[22px] border px-4 py-3 text-left ${
                type === "BUILD"
                  ? "border-[#74c8f1] bg-[#edfaff] text-slate-950 shadow-[0_16px_34px_-22px_rgba(109,201,238,0.32)]"
                  : "border-[#ecd9df] bg-white/86 text-slate-700 hover:bg-[#fff8fb]"
              }`}
              >
              <div className="text-sm font-semibold">Repeat</div>
              <div className="mt-1 text-sm text-slate-500">A practice you want to come back to.</div>
            </button>
            <button
              type="button"
              onClick={() => setType("BREAK")}
              disabled={isSaving}
              className={`pressable min-h-11 rounded-[22px] border px-4 py-3 text-left ${
                type === "BREAK"
                  ? "border-[#ffb5bd] bg-[#fff2f3] text-slate-950 shadow-[0_16px_34px_-22px_rgba(255,158,165,0.24)]"
                  : "border-[#ecd9df] bg-white/86 text-slate-700 hover:bg-[#fff8fb]"
              }`}
              >
              <div className="text-sm font-semibold">Loosen</div>
              <div className="mt-1 text-sm text-slate-500">A pattern you want to catch earlier.</div>
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="habit-minimum-action">
            Minimum step
          </label>
          <input
            id="habit-minimum-action"
            value={minimumAction}
            onChange={(event) => setMinimumAction(event.target.value)}
            placeholder="Put on shoes and walk 5 minutes"
            maxLength={HABIT_MINIMUM_ACTION_MAX_LENGTH}
            className="app-field rounded-2xl px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e6c7d3]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isSaving}
          className="pressable app-btn-primary min-h-11 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save practice
        </button>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </Card>
  );
}
