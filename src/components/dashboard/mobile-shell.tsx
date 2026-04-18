"use client";

import { HabitType, UrgeOutcome } from "@prisma/client";
import { useState } from "react";

import { CreateHabitForm } from "@/components/dashboard/create-habit-form";
import { ProgressExperience } from "@/components/dashboard/progress-experience";
import { TodayExperience } from "@/components/dashboard/today-experience";
import { UrgeFeed } from "@/components/dashboard/urge-feed";
import { AppMark } from "@/components/ui/app-mark";

type DashboardData = {
  today: string;
  dayReset: {
    mood: number;
    startedAt: string;
    startedAtLabel: string;
  } | null;
  stats: {
    totalHabits: number;
    buildHabits: number;
    breakHabits: number;
    urgesResisted: number;
    dayCompleted: boolean;
  };
  habits: {
    id: string;
    name: string;
    type: HabitType;
    minimumAction: string;
    completedToday: boolean;
    stats: {
      totalCompletions: number;
      completionsLast7Days: number;
      lastCompletedAt: string | null;
      lastCompletedAtLabel: string | null;
      totalUrges: number;
      resistedUrges: number;
      actedUrges: number;
      averageUrgeIntensity: number | null;
    };
  }[];
  recentUrges: {
    id: string;
    habitName: string;
    habitType: HabitType;
    intensity: number;
    outcome: UrgeOutcome;
    createdAt: string;
    createdAtLabel: string;
  }[];
  weeklyHistory: {
    date: string;
    label: string;
    mood: number | null;
    completed: boolean;
    completionsCount: number;
    urgesCount: number;
    resistedCount: number;
    actedCount: number;
  }[];
};

type MobileShellProps = {
  data: DashboardData;
};

type Tab = "today" | "progress" | "manage";

function IconToday() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M4 7h16" />
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 11h3" />
      <path d="M8 15h6" />
    </svg>
  );
}

function IconProgress() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-6" />
      <path d="M4 20h16" />
    </svg>
  );
}

function IconManage() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <rect x="3" y="3" width="18" height="18" rx="5" />
    </svg>
  );
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <IconToday /> },
  { id: "progress", label: "Progress", icon: <IconProgress /> },
  { id: "manage", label: "Manage", icon: <IconManage /> },
];

export function MobileShell({ data }: MobileShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [showMenu, setShowMenu] = useState(false);

  const breakHabits = data.habits.filter((habit) => habit.type === "BREAK");
  return (
    <main className="min-h-screen bg-[#09090b] px-0 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#111111] sm:min-h-[100svh] sm:border-x sm:border-white/5 sm:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_120px_-40px_rgba(0,0,0,0.8)]">
        <header
          className="sticky top-0 z-30 border-b border-white/6 bg-[#111111]/92 px-4 pb-3 backdrop-blur"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AppMark size="sm" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Daily companion
                </div>
                <h1 className="mt-1.5 text-[1.6rem] font-semibold leading-none tracking-tight">
                  Steady
                </h1>
                <p className="mt-1 text-sm text-white/72">{data.today}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
                aria-label="Open progress"
              >
                <IconProgress />
              </button>
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-[#4f6df5]/35 bg-[#1b2450] text-[#95a8ff] hover:bg-[#243069]"
                aria-label="Open quick actions"
              >
                <IconManage />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 pb-32 pt-3">
          {activeTab === "today" ? (
            <TodayExperience
              dayReset={data.dayReset}
              dayCompleted={data.stats.dayCompleted}
              habits={data.habits}
              weeklyHistory={data.weeklyHistory}
            />
          ) : null}

          {activeTab === "progress" ? (
            <div className="mt-5 grid gap-4">
              <ProgressExperience stats={data.stats} weeklyHistory={data.weeklyHistory} />
              <UrgeFeed recentUrges={data.recentUrges} />
            </div>
          ) : null}

          {activeTab === "manage" ? (
            <div className="mt-5 grid gap-4">
              <CreateHabitForm />
              <section className="rounded-[28px] border border-white/6 bg-[#171717] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                  Gentle overview
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-white/[0.03] p-4">
                    <div className="text-sm text-white/72">Habits you are growing</div>
                    <div className="mt-1 text-2xl font-semibold">{data.stats.buildHabits}</div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-4">
                    <div className="text-sm text-white/72">Loops you are softening</div>
                    <div className="mt-1 text-2xl font-semibold">{breakHabits.length}</div>
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] border-t border-white/6 bg-[#111111]/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="grid grid-cols-4 gap-2 rounded-[26px] border border-white/6 bg-[#1a1a1a] p-2 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.8)]">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  id={tab.id === "progress" ? "bottom-nav-progress" : undefined}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMenu(false);
                  }}
                  className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[20px] px-3 py-2 text-xs font-medium ${
                    active
                      ? "bg-[#2c2c2e] text-white shadow-[0_14px_30px_-24px_rgba(255,255,255,0.35)]"
                      : "text-white/65 hover:bg-white/[0.03] hover:text-white/85"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-x-4 top-1 h-1 rounded-full bg-[linear-gradient(90deg,#fbbf24_0%,#7c6cff_100%)]" />
                  ) : null}
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowMenu((value) => !value)}
              className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[20px] px-3 py-2 text-xs font-medium ${
                showMenu
                  ? "bg-[#3554d1] text-white shadow-[0_18px_36px_-24px_rgba(69,101,235,1)]"
                  : "text-white/65 hover:bg-white/[0.03] hover:text-white/85"
              }`}
            >
              {showMenu ? (
                <span className="absolute inset-x-4 top-1 h-1 rounded-full bg-[linear-gradient(90deg,#fbbf24_0%,#95a8ff_100%)]" />
              ) : null}
              <IconManage />
              <span>Menu</span>
            </button>
          </div>
        </nav>

        {showMenu ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto w-full max-w-[430px] px-4">
            <div className="animate-sheet-rise pointer-events-auto rounded-[32px] border border-white/8 bg-[#1d1d1f]/98 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manage");
                  setShowMenu(false);
                }}
                className="pressable flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3554d1] text-white">
                  <IconManage />
                </div>
                <div>
                  <div className="text-lg font-semibold">Build a good habit</div>
                  <div className="text-sm text-white/70">Create a new build or break habit</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("today");
                  setShowMenu(false);
                }}
                className="pressable mt-1 flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2a2a2c] text-white/75">
                  <IconToday />
                </div>
                <div>
                  <div className="text-lg font-semibold">Mood log</div>
                  <div className="text-sm text-white/70">Start your day and log urges fast</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("progress");
                  setShowMenu(false);
                }}
                className="pressable mt-1 flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4b544] text-black">
                  <IconProgress />
                </div>
                <div>
                  <div className="text-lg font-semibold">See your progress</div>
                  <div className="text-sm text-white/70">Review wins, resets, and urges</div>
                </div>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
