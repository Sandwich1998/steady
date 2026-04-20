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
      setError("Couldn't save this practice.");
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
      title="New practice"
      description="Choose something to return to more often, or something to interrupt earlier."
      variant="soft"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="habit-name">
            Name
          </label>
          <input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Morning walk"
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
            className="app-field rounded-2xl px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e6c7d3]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="pressable app-btn-primary min-h-11 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save practice
        </button>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </Card>
  );
}
