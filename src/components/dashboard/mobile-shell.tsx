"use client";

import { HabitType, UrgeOutcome } from "@prisma/client";
import { useState } from "react";

import { CreateHabitForm } from "@/components/dashboard/create-habit-form";
import { ProgressExperience } from "@/components/dashboard/progress-experience";
import { TodayExperience } from "@/components/dashboard/today-experience";
import { UrgeFeed } from "@/components/dashboard/urge-feed";

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
    restedToday: boolean;
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
    restCount: number;
    urgesCount: number;
    resistedCount: number;
    actedCount: number;
  }[];
  previousWeekSummary: {
    completions: number;
    brightDays: number;
    calmDays: number;
    moodAverage: number | null;
    urgesResisted: number;
    urgesCount: number;
  };
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

function IconSupport() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 21s-7-4.6-7-10.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.8C19 16.4 12 21 12 21Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
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
  const compactHeader = activeTab !== "today";
  const screenLabel =
    activeTab === "today" ? "Today" : activeTab === "progress" ? "Week" : "Practices";
  const screenTitle =
    activeTab === "today" ? "Steady" : activeTab === "progress" ? "Week" : "Practice";
  const screenSubtitle =
    activeTab === "today"
      ? data.today
      : activeTab === "progress"
        ? "See your week at a glance."
        : "Set up practices to return to, or patterns to catch earlier.";
  function openUrgeSupport() {
    setActiveTab("today");
    setShowMenu(false);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("steady:open-urge-sheet"));
    }, 80);
  }

  return (
    <main className="min-h-screen px-0 text-zinc-50">
      <div className="app-shell mx-auto flex min-h-screen w-full max-w-[430px] flex-col sm:min-h-[100svh]">
        <header
          className={`app-header sticky top-0 z-30 px-4 backdrop-blur-xl ${compactHeader ? "pb-2.5" : "pb-3"}`}
          style={{ paddingTop: `calc(env(safe-area-inset-top) + ${compactHeader ? "10px" : "12px"})` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  {screenLabel}
                </div>
                <h1
                  className={`font-semibold leading-none tracking-tight ${compactHeader ? "mt-1 text-[1.25rem]" : "mt-1.5 text-[1.6rem]"}`}
                >
                  {screenTitle}
                </h1>
                <p className={`text-zinc-400 ${compactHeader ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>
                  {compactHeader ? screenSubtitle : data.today}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                className="pressable app-btn-secondary flex h-10 w-10 items-center justify-center rounded-[14px] text-zinc-100"
                aria-label="Open progress"
              >
                <IconProgress />
              </button>
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="pressable flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/5 text-zinc-100"
                aria-label="Open support menu"
              >
                <IconSupport />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 pb-28 pt-2">
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
              <ProgressExperience
                stats={data.stats}
                weeklyHistory={data.weeklyHistory}
                previousWeekSummary={data.previousWeekSummary}
                habits={data.habits}
              />
              <UrgeFeed recentUrges={data.recentUrges} />
            </div>
          ) : null}

          {activeTab === "manage" ? (
            <div className="mt-5 grid gap-4">
              <section className="px-1 py-1">
                <div className="text-sm font-semibold text-zinc-300">Practices</div>
                <h2 className="mt-3 text-[1.8rem] font-semibold leading-[1.02] tracking-tight text-zinc-50">
                  Set up what you want to return to.
                </h2>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-zinc-400">
                  Keep each one plain, small, and easy to reach for on a hard day.
                </p>
              </section>
              <CreateHabitForm />
              <section className="px-1 py-1">
                <div className="text-sm font-semibold text-zinc-300">Practice balance</div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-white/4 px-4 py-4">
                    <div className="text-xs text-zinc-500">Repeat</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{data.stats.buildHabits}</div>
                  </div>
                  <div className="rounded-[18px] bg-white/4 px-4 py-4">
                    <div className="text-xs text-zinc-500">Loosen</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-50">{breakHabits.length}</div>
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <nav className="app-nav fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1.5 rounded-[18px] bg-[#121214]/72 p-1.5">
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
                className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-[11px] font-medium ${
                    active
                      ? "app-btn-primary"
                      : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-[linear-gradient(90deg,#25f4ee_0%,#fe2c55_100%)]" />
                  ) : null}
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowMenu((value) => !value)}
              aria-label="Open support menu"
              className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-[11px] font-medium ${
                showMenu
                  ? "app-btn-primary"
                  : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
              }`}
            >
              {showMenu ? (
                <span className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-[linear-gradient(90deg,#25f4ee_0%,#fe2c55_100%)]" />
              ) : null}
              <IconSupport />
              <span>Support</span>
            </button>
          </div>
        </nav>

        {showMenu ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-[430px] px-4">
            <div className="app-card animate-sheet-rise pointer-events-auto rounded-[24px] p-4 backdrop-blur">
              <button
                type="button"
                onClick={openUrgeSupport}
                className="pressable flex w-full items-center gap-4 rounded-[24px] bg-white/4 px-3 py-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#25f4ee_0%,#fe2c55_100%)] text-white">
                  <IconSupport />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">Urge support</div>
                  <div className="text-sm text-zinc-400">Delay it, move, and change rooms.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manage");
                  setShowMenu(false);
                }}
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-zinc-100">
                  <IconManage />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">New practice</div>
                  <div className="text-sm text-zinc-400">Add a practice to return to, or a pattern to catch earlier.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("today");
                  setShowMenu(false);
                }}
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-zinc-100">
                  <IconToday />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">Go to today</div>
                  <div className="text-sm text-zinc-400">Check in and move through today.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("progress");
                  setShowMenu(false);
                }}
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/6 text-zinc-100">
                  <IconProgress />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">Week view</div>
                  <div className="text-sm text-zinc-400">See your week, mood, and patterns.</div>
                </div>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
