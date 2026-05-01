"use client";

import type { HabitType, UrgeOutcome } from "@prisma/client";
import { useMemo, useState } from "react";

type UrgeMoment = {
  id: string;
  habitName: string;
  habitType: HabitType;
  intensity: number;
  outcome: UrgeOutcome;
  createdAt: string;
  createdAtLabel: string;
};

type UrgeFeedProps = {
  recentUrges: UrgeMoment[];
};

const INITIAL_VISIBLE = 5;
const PAGE_SIZE = 8;
const OUTCOME_COPY: Record<UrgeOutcome, { label: string; line: string }> = {
  RESISTED: {
    label: "Handled",
    line: "Before acting",
  },
  ACTED: {
    label: "Slip",
    line: "Acted on urge",
  },
};

const strengthLabels = ["", "Low", "Mild", "Moderate", "Strong", "Very strong"] as const;

function getMostCommonHabit(urges: UrgeMoment[]) {
  const counts = urges.reduce<Map<string, number>>((map, urge) => {
    map.set(urge.habitName, (map.get(urge.habitName) ?? 0) + 1);
    return map;
  }, new Map());

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function getStrengthLabel(value: number) {
  return strengthLabels[Math.min(Math.max(Math.round(value), 1), 5)];
}

function StrengthMeter({ value }: { value: number }) {
  const label = getStrengthLabel(value);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-zinc-500">Urge strength</span>
        <span className="font-semibold text-zinc-200">
          {label} · {value}/5
        </span>
      </div>
      <div
        role="meter"
        aria-label="Urge strength"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
        aria-valuetext={`${label}, ${value} out of 5`}
        className="h-2.5 overflow-hidden rounded-full bg-white/9"
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#37f5dc_0%,#f6d365_52%,#ff2f68_100%)]"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium text-zinc-600">
        <span>Low</span>
        <span>Very strong</span>
      </div>
    </div>
  );
}

export function UrgeFeed({ recentUrges }: UrgeFeedProps) {
  const [loadedUrges, setLoadedUrges] = useState(recentUrges);
  const [visibleCount, setVisibleCount] = useState(Math.min(INITIAL_VISIBLE, recentUrges.length));
  const [hasMore, setHasMore] = useState(recentUrges.length >= PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const visibleUrges = loadedUrges.slice(0, visibleCount);
  const hiddenLoadedCount = Math.max(loadedUrges.length - visibleCount, 0);
  const resistedCount = loadedUrges.filter((urge) => urge.outcome === "RESISTED").length;
  const averageIntensity =
    loadedUrges.length > 0
      ? loadedUrges.reduce((sum, urge) => sum + urge.intensity, 0) / loadedUrges.length
      : 0;
  const resistedPercent =
    loadedUrges.length > 0 ? Math.round((resistedCount / loadedUrges.length) * 100) : 0;
  const actedPercent = loadedUrges.length > 0 ? 100 - resistedPercent : 0;
  const mostCommonHabit = useMemo(() => getMostCommonHabit(loadedUrges), [loadedUrges]);
  const averageStrengthLabel = getStrengthLabel(averageIntensity);
  const canShowMore = hiddenLoadedCount > 0 || hasMore;

  async function showMore() {
    if (isLoadingMore) return;
    setError("");

    if (hiddenLoadedCount > 0) {
      setVisibleCount((count) => Math.min(count + INITIAL_VISIBLE, loadedUrges.length));
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch(`/api/urges?offset=${loadedUrges.length}&limit=${PAGE_SIZE}`);

      if (!response.ok) {
        setError("Couldn't load older urge moments.");
        return;
      }

      const data = (await response.json()) as { urges?: UrgeMoment[] };
      const nextUrges = data.urges ?? [];
      const existingIds = new Set(loadedUrges.map((urge) => urge.id));
      const newUrges = nextUrges.filter((urge) => !existingIds.has(urge.id));
      const nextLoadedCount = loadedUrges.length + newUrges.length;

      setLoadedUrges((current) => [...current, ...newUrges]);
      setVisibleCount((count) => Math.min(count + INITIAL_VISIBLE, nextLoadedCount));
      setHasMore(nextUrges.length === PAGE_SIZE);
    } catch {
      setError("Couldn't load older urge moments.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <section className="app-card reveal stagger-3 rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[18rem]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Recent urges
          </div>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-tight text-zinc-50">
            Urge history
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {loadedUrges.length > 0
              ? `Recent urge moments you logged, how strong they felt, and what happened.`
              : "Recent urge moments will show here after you log them."}
          </p>
        </div>
        {loadedUrges.length > 0 ? (
          <div className="shrink-0 rounded-full bg-white/7 px-3 py-1.5 text-xs font-semibold text-zinc-300">
            {resistedCount} of {loadedUrges.length} handled
          </div>
        ) : null}
      </div>

      {loadedUrges.length === 0 ? (
        <p className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-white/4 p-4 text-sm text-zinc-400">
          No urge moments yet. If one hits, support is ready.
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="metric-tile rounded-[20px] p-3">
              <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-zinc-500">
                Handled
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-50">
                {resistedCount}
                <span className="text-base text-zinc-500">/{loadedUrges.length}</span>
              </div>
              <div className="mt-1 text-xs leading-4 text-zinc-500">
                before acting
              </div>
            </div>
            <div className="metric-tile rounded-[20px] p-3">
              <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-zinc-500">
                Avg strength
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-50">
                {averageIntensity.toFixed(1)}
                <span className="text-base text-zinc-500">/5</span>
              </div>
              <div className="mt-1 text-xs leading-4 text-zinc-500">
                {averageStrengthLabel}
              </div>
            </div>
            <div className="metric-tile min-w-0 rounded-[20px] p-3">
              <div className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-zinc-500">
                Top pattern
              </div>
              <div className="mt-2 truncate text-sm font-semibold leading-6 text-zinc-50">
                {mostCommonHabit ?? "None"}
              </div>
              <div className="mt-1 text-xs leading-4 text-zinc-500">
                most logged
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/8 bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium">
              <span className="text-zinc-400">Handled vs slipped</span>
              <span className="text-zinc-500">
                {resistedPercent}% / {actedPercent}%
              </span>
            </div>
            <div className="overflow-hidden rounded-full bg-white/8">
              <div className="flex h-2.5 w-full">
                <div
                  className="bg-[var(--accent-mint)]"
                  style={{ width: `${resistedPercent}%` }}
                />
                <div
                  className="bg-[var(--accent-rose)]"
                  style={{ width: `${actedPercent}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-[#7af7f2]">Handled before acting</span>
              <span className="text-[#ff7d9a]">Slip logged</span>
            </div>
          </div>

          <div className="grid gap-3">
            {visibleUrges.map((urge) => {
              const outcome = OUTCOME_COPY[urge.outcome];
              const resisted = urge.outcome === "RESISTED";

              return (
                <article
                  key={urge.id}
                  className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-zinc-50">
                          {urge.habitName}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {outcome.line}
                          <span className="text-zinc-600"> · {urge.createdAtLabel}</span>
                        </p>
                      </div>
                      <div
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          resisted
                            ? "bg-[#0d2d31] text-[#7af7f2]"
                            : "bg-[#34121d] text-[#ff7d9a]"
                        }`}
                      >
                        {outcome.label}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`h-px ${
                      resisted ? "bg-[#37f5dc]/18" : "bg-[#ff2f68]/18"
                    }`}
                  />
                  <div>
                    <StrengthMeter value={urge.intensity} />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="grid gap-2">
            {canShowMore ? (
              <button
                type="button"
                onClick={showMore}
                disabled={isLoadingMore}
                className="pressable app-btn-secondary min-h-11 rounded-[16px] px-4 py-3 text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore
                  ? "Loading older moments"
                  : hiddenLoadedCount > 0
                    ? `Show ${Math.min(hiddenLoadedCount, INITIAL_VISIBLE)} more`
                    : "Load older moments"}
              </button>
            ) : null}

            {visibleCount > INITIAL_VISIBLE ? (
              <button
                type="button"
                onClick={() => setVisibleCount(Math.min(INITIAL_VISIBLE, loadedUrges.length))}
                className="pressable min-h-10 rounded-[14px] px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              >
                Show latest only
              </button>
            ) : null}

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </div>
        </div>
      )}
    </section>
  );
}
