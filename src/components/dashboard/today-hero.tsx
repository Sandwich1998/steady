"use client";

import { useEffect, useState } from "react";
import { AppMark } from "@/components/ui/app-mark";

type TodayHeroProps = {
  title: string;
  subtitle: string;
  progressLabel: string;
  completedCount: number;
  totalCount: number;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  weekSummary: {
    date: string;
    completed: boolean;
    mood: number | null;
  }[];
};

function getProgress(completedCount: number, totalCount: number) {
  if (totalCount === 0) return 0;
  return Math.min(completedCount / totalCount, 1);
}

export function TodayHero({
  title,
  subtitle,
  progressLabel,
  completedCount,
  totalCount,
  onPrimaryAction,
  primaryActionLabel,
  weekSummary,
}: TodayHeroProps) {
  const progress = getProgress(completedCount, totalCount);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [barsReady, setBarsReady] = useState(false);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - circumference * animatedProgress;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnimatedProgress(progress);
      setBarsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.24),transparent_34%),linear-gradient(180deg,#1b1730_0%,#131322_56%,#111111_100%)] px-5 py-6 shadow-[0_30px_90px_-40px_rgba(86,63,194,0.7)]">
      <div className="pointer-events-none absolute -right-12 top-8 h-36 w-36 rounded-full bg-[#7c6cff]/18 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[#f59e0b]/18 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="max-w-[14rem]">
          <div className="flex items-center gap-2">
            <AppMark size="sm" />
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f7d98e]">
              Your daily spark
            </div>
          </div>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.02] tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/74">{subtitle}</p>
        </div>

        <div className="relative shrink-0">
          <svg viewBox="0 0 140 140" className="h-34 w-34 -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#todayRing)"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
            <defs>
              <linearGradient id="todayRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="55%" stopColor="#7c6cff" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="animate-ring-breathe flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff5c4_0%,#f7bf4c_42%,#f08c35_100%)] shadow-[0_12px_40px_-16px_rgba(251,191,36,0.9)]" />
            <div className="mt-3 text-center">
              <div className="text-2xl font-semibold text-white">
                {completedCount}/{Math.max(totalCount, 1)}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                {progressLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onPrimaryAction}
        className="relative mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-[#3554d1] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(69,101,235,1)] transition hover:scale-[1.01] hover:bg-[#4565eb] active:scale-[0.99]"
      >
        {primaryActionLabel}
      </button>

      <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">This week, softly visible</div>
            <div className="mt-1 text-sm text-white/62">
              Fewer numbers. More sense of how your rhythm is forming.
            </div>
          </div>
          <div className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white/78">
            {weekSummary.filter((day) => day.completed).length} bright days
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          {weekSummary.map((day, index) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`w-full rounded-full transition ${
                  day.completed
                    ? "bg-[linear-gradient(180deg,#fbbf24_0%,#7c6cff_100%)] shadow-[0_10px_24px_-14px_rgba(124,108,255,1)]"
                    : "bg-white/[0.08]"
                }`}
                style={{
                  height: `${barsReady ? (day.completed ? 46 : day.mood ? 28 + day.mood * 4 : 18) : 12}px`,
                  transitionDuration: "560ms",
                  transitionDelay: `${index * 55}ms`,
                  transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                }}
              />
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                {day.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
