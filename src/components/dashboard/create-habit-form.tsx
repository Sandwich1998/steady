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
      title="Create habit"
      description="Keep habits tight. One name, one minimum action, one clear direction."
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
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white/78" htmlFor="habit-type">
            Type
          </label>
          <select
            id="habit-type"
            value={type}
            onChange={(event) => setType(event.target.value as "BUILD" | "BREAK")}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/20"
          >
            <option value="BUILD">Build</option>
            <option value="BREAK">Break</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white/78" htmlFor="habit-minimum-action">
            Minimum action
          </label>
          <input
            id="habit-minimum-action"
            value={minimumAction}
            onChange={(event) => setMinimumAction(event.target.value)}
            placeholder="Put on shoes and walk 5 minutes"
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#3554d1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4565eb] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add habit
        </button>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </form>
    </Card>
  );
}
