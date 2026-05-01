"use client";

import { HabitType, UrgeOutcome } from "@prisma/client";
import { useState } from "react";

import { CreateHabitForm } from "@/components/dashboard/create-habit-form";
import { ProgressExperience } from "@/components/dashboard/progress-experience";
import { TodayExperience } from "@/components/dashboard/today-experience";
import { UrgeFeed } from "@/components/dashboard/urge-feed";

type DashboardData = {
  user: {
    username: string;
    email: string;
    imageUrl: string | null;
  };
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
      urgesLast7Days: number;
      resistedUrgesLast7Days: number;
      actedUrgesLast7Days: number;
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

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M12 2.8 13.9 9l6.2 1.9-6.2 1.9L12 19l-1.9-6.2-6.2-1.9L10.1 9 12 2.8Z" />
      <path d="m18.4 16.3.6 2.1 2.1.6-2.1.7-.6 2-.7-2-2.1-.7 2.1-.6.7-2.1Z" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

const tabs: { id: Tab; label: string; icon: React.ReactNode; summary: string }[] = [
  { id: "today", label: "Today", icon: <IconToday />, summary: "Check in and finish small." },
  { id: "progress", label: "Progress", icon: <IconProgress />, summary: "Read the last 7 days." },
  { id: "manage", label: "Manage", icon: <IconManage />, summary: "Tune your practices." },
];

const moodLabels: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

function getTabCopy(tab: Tab, today: string) {
  if (tab === "progress") {
    return {
      eyebrow: "Last 7 days",
      title: "Week",
      subtitle: "Patterns, pressure, and the returns that count.",
    };
  }

  if (tab === "manage") {
    return {
      eyebrow: "Practices",
      title: "Practice",
      subtitle: "Set up what you want to repeat, or loosen what keeps pulling.",
    };
  }

  return {
    eyebrow: "Today",
    title: "Steady",
    subtitle: today,
  };
}

function DesktopNav({
  activeTab,
  setActiveTab,
  openUrgeSupport,
  onLogout,
  user,
  hasBreakHabits,
  heldCount,
  totalHabits,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  openUrgeSupport: () => void;
  onLogout: () => void;
  user: DashboardData["user"];
  hasBreakHabits: boolean;
  heldCount: number;
  totalHabits: number;
}) {
  const initial = user.username.slice(0, 1).toUpperCase();

  return (
    <aside className="hidden min-h-[calc(100svh-2.5rem)] flex-col justify-between rounded-[30px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:flex">
      <div>
        <div className="flex items-center gap-3 rounded-[24px] bg-white/[0.055] p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#37f5dc_0%,#ff2f68_100%)] text-[#07080a] shadow-[0_20px_50px_-28px_rgba(55,245,220,0.75)]">
            <IconSpark />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-zinc-50">Steady</div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Reset companion
            </div>
          </div>
        </div>

        <nav className="mt-6 grid gap-2" aria-label="Primary">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`pressable flex items-center gap-3 rounded-[20px] px-3 py-3 text-left ${
                  active
                    ? "app-btn-primary"
                    : "text-zinc-400 hover:bg-white/[0.055] hover:text-zinc-50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] ${
                    active ? "bg-white/18" : "bg-white/[0.055]"
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-white/78" : "text-zinc-500"}`}>
                    {tab.summary}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-white/10 text-sm font-semibold text-zinc-50">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-50">{user.username}</div>
              <div className="truncate text-xs text-zinc-500">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="pressable mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-zinc-50"
          >
            <IconSignOut />
            Sign out
          </button>
        </div>

        <div className="metric-tile rounded-[24px] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Today held
          </div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-3xl font-semibold tracking-tight text-zinc-50">{heldCount}</div>
            <div className="pb-1 text-sm text-zinc-500">/ {Math.max(totalHabits, 1)}</div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#37f5dc_0%,#ff2f68_100%)]"
              style={{
                width: `${totalHabits > 0 ? Math.min((heldCount / totalHabits) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {hasBreakHabits ? (
          <button
            type="button"
            onClick={openUrgeSupport}
            className="pressable app-btn-quiet flex min-h-12 items-center justify-between rounded-[20px] px-4 py-3 text-sm font-semibold"
          >
            <span>Urge hitting now</span>
            <IconSupport />
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function DesktopContext({
  data,
  openUrgeSupport,
}: {
  data: DashboardData;
  openUrgeSupport: () => void;
}) {
  const heldCount = data.habits.filter((habit) => habit.completedToday || habit.restedToday).length;
  const openCount = Math.max(data.habits.length - heldCount, 0);
  const todayUrges = data.weeklyHistory.at(-1)?.urgesCount ?? 0;
  const totalCompletions = data.weeklyHistory.reduce((sum, day) => sum + day.completionsCount, 0);
  const totalResisted = data.weeklyHistory.reduce((sum, day) => sum + day.resistedCount, 0);
  const nextHabit =
    data.habits.find((habit) => !habit.completedToday && !habit.restedToday) ?? null;

  return (
    <aside className="hidden min-h-[calc(100svh-2.5rem)] grid-rows-[auto_1fr] gap-4 lg:grid">
      <section className="app-card grain-card rounded-[30px] p-5">
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Today state
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-zinc-50">
                {data.stats.dayCompleted ? "Wrapped cleanly." : "Keep the next step visible."}
              </h2>
            </div>
            <div className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-zinc-300">
              {openCount} open
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="metric-tile rounded-[20px] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Held</div>
              <div className="mt-2 text-2xl font-semibold text-zinc-50">{heldCount}</div>
            </div>
            <div className="metric-tile rounded-[20px] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Urges</div>
              <div className="mt-2 text-2xl font-semibold text-zinc-50">{todayUrges}</div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] bg-white/[0.045] p-4">
            <div className="text-sm font-semibold text-zinc-50">
              {nextHabit ? nextHabit.name : "No open practice"}
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {nextHabit
                ? nextHabit.minimumAction
                : "If pressure returns later, keep support close and leave the day finished."}
            </p>
          </div>

          {data.stats.breakHabits > 0 ? (
            <button
              type="button"
              onClick={openUrgeSupport}
              className="pressable app-btn-primary mt-4 min-h-12 w-full rounded-[18px] px-5 py-3 text-sm font-semibold"
            >
              Urge hitting now
            </button>
          ) : null}
        </div>
      </section>

      <section className="app-card rounded-[30px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Weekly read
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-50">
              {totalCompletions > 0 ? "You have evidence." : "Start collecting signal."}
            </h2>
          </div>
          <div className="text-right text-sm font-semibold text-zinc-300">
            {totalCompletions}
            <div className="text-xs font-medium text-zinc-500">returns</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between rounded-[18px] bg-white/[0.045] px-4 py-3 text-sm">
            <span className="text-zinc-400">Mood</span>
            <span className="font-semibold text-zinc-50">
              {data.dayReset ? moodLabels[data.dayReset.mood] : "Unchecked"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-[18px] bg-white/[0.045] px-4 py-3 text-sm">
            <span className="text-zinc-400">Interrupted</span>
            <span className="font-semibold text-zinc-50">{totalResisted}</span>
          </div>
          <div className="flex items-center justify-between rounded-[18px] bg-white/[0.045] px-4 py-3 text-sm">
            <span className="text-zinc-400">Practice mix</span>
            <span className="font-semibold text-zinc-50">
              {data.stats.buildHabits}/{data.stats.breakHabits}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
}

function ManageExperience({ data }: { data: DashboardData }) {
  const buildPercent =
    data.stats.totalHabits > 0
      ? Math.round((data.stats.buildHabits / data.stats.totalHabits) * 100)
      : 0;
  const breakPercent =
    data.stats.totalHabits > 0
      ? Math.round((data.stats.breakHabits / data.stats.totalHabits) * 100)
      : 0;
  const mostActiveHabit =
    [...data.habits].sort(
      (a, b) =>
        b.stats.completionsLast7Days +
        b.stats.resistedUrgesLast7Days -
        (a.stats.completionsLast7Days + a.stats.resistedUrgesLast7Days),
    )[0] ?? null;

  return (
    <div className="mt-5 grid gap-4 lg:mt-0">
      <section className="reveal app-card grain-card rounded-[30px] p-5 sm:p-6">
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)] md:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Practice system
            </div>
            <h2 className="mt-3 max-w-[34rem] text-[2rem] font-semibold leading-[1.02] tracking-tight text-zinc-50 sm:text-[2.6rem]">
              Set up returns that still work on a bad day.
            </h2>
            <p className="mt-3 max-w-[32rem] text-sm leading-6 text-zinc-400">
              Strong systems are specific, visible, and small enough to start when motivation is low.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-tile rounded-[22px] p-4">
              <div className="text-xs text-zinc-500">Repeat</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-50">{data.stats.buildHabits}</div>
              <div className="mt-1 text-xs text-zinc-500">{buildPercent}% of system</div>
            </div>
            <div className="metric-tile rounded-[22px] p-4">
              <div className="text-xs text-zinc-500">Loosen</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-50">{data.stats.breakHabits}</div>
              <div className="mt-1 text-xs text-zinc-500">{breakPercent}% of system</div>
            </div>
          </div>
        </div>
      </section>

      <CreateHabitForm />

      <section className="reveal stagger-2 grid gap-3 md:grid-cols-3">
        <article className="app-card-soft rounded-[24px] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Strongest cue
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-50">
            {mostActiveHabit?.name ?? "Add a practice"}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {mostActiveHabit
              ? `${mostActiveHabit.stats.completionsLast7Days} returns this week. Keep this one easy to reach.`
              : "Create one repeat or loosen practice to start the loop."}
          </p>
        </article>
        <article className="app-card-soft rounded-[24px] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Design rule
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-50">Make the first move obvious.</div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Minimum steps should describe the next physical action, not the ideal outcome.
          </p>
        </article>
        <article className="app-card-soft rounded-[24px] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Pressure plan
          </div>
          <div className="mt-3 text-lg font-semibold text-zinc-50">Catch patterns earlier.</div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Loosen practices work best with a delay, a room change, and a replacement ready.
          </p>
        </article>
      </section>
    </div>
  );
}

export function MobileShell({ data }: MobileShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [showMenu, setShowMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const copy = getTabCopy(activeTab, data.today);
  const breakHabits = data.habits.filter((habit) => habit.type === "BREAK");
  const heldCount = data.habits.filter((habit) => habit.completedToday || habit.restedToday).length;
  const compactHeader = activeTab !== "today";
  const userInitial = data.user.username.slice(0, 1).toUpperCase();

  function openUrgeSupport() {
    setActiveTab("today");
    setShowMenu(false);
    setShowAccount(false);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("steady:open-urge-sheet"));
    }, 80);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-zinc-50">
      <div className="ambient-shift pointer-events-none fixed left-0 top-24 h-56 w-56 rounded-full bg-[rgba(55,245,220,0.12)] blur-3xl" />
      <div className="ambient-shift pointer-events-none fixed right-8 top-6 h-60 w-60 rounded-full bg-[rgba(255,47,104,0.16)] blur-3xl [animation-delay:2s]" />

      <div className="app-shell relative mx-auto grid min-h-screen w-full max-w-[430px] lg:max-w-[1180px] lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:gap-5 lg:bg-transparent lg:px-5 lg:py-5">
        <DesktopNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowMenu(false);
            setShowAccount(false);
          }}
          openUrgeSupport={openUrgeSupport}
          onLogout={handleLogout}
          user={data.user}
          hasBreakHabits={breakHabits.length > 0}
          heldCount={heldCount}
          totalHabits={data.habits.length}
        />

        <section className="min-w-0">
          <header
            className={`app-header sticky top-0 z-30 border-b px-4 backdrop-blur-xl lg:static lg:rounded-[30px] lg:border lg:bg-white/[0.04] lg:px-5 lg:backdrop-blur-2xl ${
              compactHeader ? "pb-2.5" : "pb-3"
            }`}
            style={{
              paddingTop: `calc(env(safe-area-inset-top) + ${compactHeader ? "10px" : "12px"})`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  {copy.eyebrow}
                </div>
                <h1
                  className={`font-semibold leading-none tracking-tight ${
                    compactHeader ? "mt-1 text-[1.25rem]" : "mt-1.5 text-[1.6rem]"
                  } lg:text-[2rem]`}
                >
                  {copy.title}
                </h1>
                <p
                  className={`max-w-[34rem] text-zinc-400 ${
                    compactHeader ? "mt-0.5 text-xs" : "mt-1 text-sm"
                  } lg:mt-2 lg:text-sm lg:leading-6`}
                >
                  {copy.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("progress");
                    setShowMenu(false);
                    setShowAccount(false);
                  }}
                  className="pressable app-btn-secondary flex h-11 w-11 items-center justify-center rounded-[14px] text-zinc-100 lg:hidden"
                  aria-label="Open progress"
                >
                  <IconProgress />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu((value) => !value);
                    setShowAccount(false);
                  }}
                  className="pressable app-btn-secondary flex h-11 w-11 items-center justify-center rounded-[14px] text-zinc-100"
                  aria-label="Open support menu"
                >
                  <IconSupport />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAccount((value) => !value);
                    setShowMenu(false);
                  }}
                  className="pressable app-btn-secondary flex h-11 w-11 items-center justify-center rounded-[14px] text-sm font-semibold text-zinc-100"
                  aria-label="Open account menu"
                >
                  {userInitial}
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 pb-28 pt-2 lg:px-0 lg:pb-0 lg:pt-4">
            {activeTab === "today" ? (
              <TodayExperience
                dayReset={data.dayReset}
                dayCompleted={data.stats.dayCompleted}
                habits={data.habits}
                weeklyHistory={data.weeklyHistory}
              />
            ) : null}

            {activeTab === "progress" ? (
              <div className="mt-5 grid gap-4 lg:mt-0">
                <ProgressExperience
                  stats={data.stats}
                  weeklyHistory={data.weeklyHistory}
                  previousWeekSummary={data.previousWeekSummary}
                  habits={data.habits}
                />
                <UrgeFeed recentUrges={data.recentUrges} />
              </div>
            ) : null}

            {activeTab === "manage" ? <ManageExperience data={data} /> : null}
          </div>
        </section>

        <DesktopContext data={data} openUrgeSupport={openUrgeSupport} />

        <nav className="app-nav fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 gap-1.5 rounded-[22px] border border-white/10 bg-[#101113]/86 p-1.5 shadow-[0_20px_70px_-44px_rgba(0,0,0,0.95)]">
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
                    setShowAccount(false);
                  }}
                  className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[16px] px-2 py-2 text-[11px] font-medium ${
                    active
                      ? "app-btn-primary"
                      : "text-zinc-400 hover:bg-white/4 hover:text-zinc-100"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-[linear-gradient(90deg,#37f5dc_0%,#fff_45%,#ff2f68_100%)]" />
                  ) : null}
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setShowMenu((value) => !value);
                setShowAccount(false);
              }}
              aria-label="Open support menu"
              className={`pressable relative flex flex-col items-center justify-center gap-1 rounded-[16px] px-2 py-2 text-[11px] font-medium ${
                showMenu
                  ? "app-btn-primary"
                  : "text-zinc-400 hover:bg-white/4 hover:text-zinc-100"
              }`}
            >
              {showMenu ? (
                <span className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-[linear-gradient(90deg,#37f5dc_0%,#fff_45%,#ff2f68_100%)]" />
              ) : null}
              <IconSupport />
              <span>Support</span>
            </button>
          </div>
        </nav>

        {showMenu ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-[430px] px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0 lg:max-w-[340px]">
            <div className="app-card animate-sheet-rise pointer-events-auto rounded-[26px] p-4 backdrop-blur">
              <button
                type="button"
                onClick={openUrgeSupport}
                className="pressable flex w-full items-center gap-4 rounded-[24px] bg-white/6 px-3 py-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#37f5dc_0%,#ff2f68_100%)] text-[#07080a]">
                  <IconSupport />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">Urge hitting now</div>
                  <div className="text-sm text-zinc-400">Delay it, move, and change rooms.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manage");
                  setShowMenu(false);
                }}
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-zinc-100">
                  <IconManage />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-50">New practice</div>
                  <div className="text-sm text-zinc-400">Add a return or catch a pattern earlier.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("today");
                  setShowMenu(false);
                }}
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-zinc-100">
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
                className="pressable mt-2 flex w-full items-center gap-4 rounded-[24px] px-3 py-3 text-left hover:bg-white/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8 text-zinc-100">
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

        {showAccount ? (
          <div className="pointer-events-none fixed inset-x-0 top-[calc(4.8rem+env(safe-area-inset-top))] z-50 mx-auto w-full max-w-[430px] px-4 lg:left-auto lg:right-6 lg:top-8 lg:mx-0 lg:max-w-[320px]">
            <div className="app-card animate-sheet-rise pointer-events-auto rounded-[26px] p-4 backdrop-blur">
              <div className="flex items-center gap-3 rounded-[22px] bg-white/[0.055] p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#37f5dc_0%,#ff2f68_100%)] text-base font-black text-[#07080a]">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-zinc-50">
                    {data.user.username}
                  </div>
                  <div className="truncate text-sm text-zinc-400">{data.user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/[0.08] hover:text-zinc-50"
              >
                <IconSignOut />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
