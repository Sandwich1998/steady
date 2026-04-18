"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

export function CreateHabitForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [minimumAction, setMinimumAction] = useState("");
  const [type, setType] = useState<"BUILD" | "BREAK">("BUILD");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, minimumAction, type }),
    });

    if (!response.ok) {
      setError("Unable to create the habit.");
      return;
    }

    setName("");
    setMinimumAction("");
    setType("BUILD");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card
      title="Shape a new rhythm"
      description="Give it a clean name, one tiny floor, and one clear direction."
      variant="soft"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white/78" htmlFor="habit-name">
            Habit name
          </label>
          <input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Morning walk"
            className="min-h-11 rounded-2xl border border-white/8 bg-[#18181a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
            required
          />
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium text-white/78">Direction</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("BUILD")}
              className={`pressable min-h-11 rounded-[22px] border px-4 py-3 text-left ${
                type === "BUILD"
                  ? "border-[#3554d1]/50 bg-[#1d2550] text-white shadow-[0_16px_34px_-22px_rgba(69,101,235,0.9)]"
                  : "border-white/8 bg-[#18181a] text-white/78 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-sm font-semibold">Grow</div>
              <div className="mt-1 text-sm text-white/62">A habit you want more of</div>
            </button>
            <button
              type="button"
              onClick={() => setType("BREAK")}
              className={`pressable min-h-11 rounded-[22px] border px-4 py-3 text-left ${
                type === "BREAK"
                  ? "border-[#88405a]/45 bg-[#301d25] text-white shadow-[0_16px_34px_-22px_rgba(136,64,90,0.9)]"
                  : "border-white/8 bg-[#18181a] text-white/78 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-sm font-semibold">Soften</div>
              <div className="mt-1 text-sm text-white/62">A loop you want less of</div>
            </button>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white/78" htmlFor="habit-minimum-action">
            Tiny floor
          </label>
          <input
            id="habit-minimum-action"
            value={minimumAction}
            onChange={(event) => setMinimumAction(event.target.value)}
            placeholder="Put on shoes and walk 5 minutes"
            className="min-h-11 rounded-2xl border border-white/8 bg-[#18181a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="pressable min-h-11 rounded-full bg-[#3554d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4565eb] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add this rhythm
        </button>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </Card>
  );
}
