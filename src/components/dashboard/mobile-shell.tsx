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
  const compactHeader = activeTab !== "today";
  const screenLabel =
    activeTab === "today" ? "Today" : activeTab === "progress" ? "Week" : "Practices";
  const screenTitle =
    activeTab === "today" ? "Steady" : activeTab === "progress" ? "Week" : "Practice";
  return (
    <main className="min-h-screen px-0 text-slate-950">
      <div className="app-shell mx-auto flex min-h-screen w-full max-w-[430px] flex-col sm:min-h-[100svh] sm:border-x sm:border-[#ecd9df] sm:shadow-[0_0_0_1px_rgba(239,220,226,0.9),0_40px_120px_-52px_rgba(214,173,183,0.38)]">
        <header
          className={`app-header sticky top-0 z-30 px-4 backdrop-blur ${compactHeader ? "pb-2.5" : "pb-3"}`}
          style={{ paddingTop: `calc(env(safe-area-inset-top) + ${compactHeader ? "10px" : "12px"})` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {screenLabel}
                </div>
                <h1
                  className={`font-semibold leading-none tracking-tight ${compactHeader ? "mt-1 text-[1.25rem]" : "mt-1.5 text-[1.6rem]"}`}
                >
                  {screenTitle}
                </h1>
                <p className={`text-slate-600 ${compactHeader ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>
                  {compactHeader
                    ? activeTab === "progress"
                      ? "Held days, pressure, mood."
                      : "Write practices you can return to."
                    : data.today}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("progress")}
                className="pressable app-btn-secondary flex h-11 w-11 items-center justify-center rounded-full text-slate-700"
                aria-label="Open progress"
              >
                <IconProgress />
              </button>
              <button
                type="button"
                onClick={() => setShowMenu((value) => !value)}
                className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-[#ead6dd] bg-white/85 text-slate-700"
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
              <section className="app-card-soft overflow-hidden rounded-[30px] px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Practices
                </div>
                <h2 className="mt-3 text-[1.8rem] font-semibold leading-[1.02] tracking-tight text-slate-950">
                  Set up what you want to return to.
                </h2>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-600">
                  Keep each one plain, small, and doable on a rough day.
                </p>
              </section>
              <CreateHabitForm />
              <section className="rounded-[28px] border border-[#ecd9df] bg-white/70 p-5 shadow-[0_18px_40px_-34px_rgba(214,173,183,0.22)]">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Counts
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-4 py-3 text-sm text-slate-700">
                    <span className="text-slate-950">Repeat:</span> {data.stats.buildHabits}
                  </div>
                  <div className="rounded-full border border-[#ecd9df] bg-[#fff7fb] px-4 py-3 text-sm text-slate-700">
                    <span className="text-slate-950">Loosen:</span> {breakHabits.length}
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <nav className="app-nav fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] border-t px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="grid grid-cols-4 gap-2 rounded-[26px] border border-[#ecd9df] bg-white/92 p-2 shadow-[0_20px_40px_-24px_rgba(214,173,183,0.26)]">
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
                      ? "bg-[#fff0f4] text-slate-950 shadow-[0_14px_30px_-24px_rgba(255,173,187,0.36)]"
                      : "text-slate-500 hover:bg-[#fff4f7] hover:text-slate-800"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-x-4 top-1 h-1 rounded-full bg-[linear-gradient(90deg,#69d7ca_0%,#ffc978_100%)]" />
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
                  ? "app-btn-primary shadow-[0_18px_36px_-24px_rgba(109,201,238,0.48)]"
                  : "text-slate-500 hover:bg-[#fff4f7] hover:text-slate-800"
              }`}
            >
              {showMenu ? (
                <span className="absolute inset-x-4 top-1 h-1 rounded-full bg-[linear-gradient(90deg,#69d7ca_0%,#ffc978_100%)]" />
              ) : null}
              <IconManage />
              <span>Menu</span>
            </button>
          </div>
        </nav>

        {showMenu ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 mx-auto w-full max-w-[430px] px-4">
            <div className="app-card animate-sheet-rise pointer-events-auto rounded-[32px] p-4 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manage");
                  setShowMenu(false);
                }}
                className="pressable flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-[#fff4f7]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#8be6dc_0%,#6cc8f4_100%)] text-slate-800">
                  <IconManage />
                </div>
                <div>
                  <div className="text-lg font-semibold">New practice</div>
                  <div className="text-sm text-slate-600">Add something to repeat or loosen</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("today");
                  setShowMenu(false);
                }}
                className="pressable mt-1 flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-[#fff4f7]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1f5] text-slate-700">
                  <IconToday />
                </div>
                <div>
                  <div className="text-lg font-semibold">Go to today</div>
                  <div className="text-sm text-slate-600">Check in and mark today&apos;s holds</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("progress");
                  setShowMenu(false);
                }}
                className="pressable mt-1 flex w-full items-center gap-4 rounded-[22px] px-3 py-3 text-left hover:bg-[#fff4f7]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffd68b_0%,#8be6dc_100%)] text-slate-800">
                  <IconProgress />
                </div>
                <div>
                  <div className="text-lg font-semibold">Week view</div>
                  <div className="text-sm text-slate-600">See held days, pressure, and mood</div>
                </div>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
