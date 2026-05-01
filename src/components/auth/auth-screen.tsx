"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type AuthMode = "login" | "register" | "recover";

type AuthScreenProps = {
  errorCode?: string;
};

const errorCopy: Record<string, string> = {
  expired_verification: "That verification link has expired. Create a new account or ask for a fresh link.",
  google_email: "Google did not return a verified email address.",
  google_exchange: "Google sign-in could not be completed.",
  google_not_configured: "Google sign-in is not configured yet.",
  google_profile: "Google profile details could not be loaded.",
  google_state: "Google sign-in expired. Please try again.",
  invalid_verification: "That verification link is no longer valid.",
  missing_verification: "Verification link is missing a token.",
  registration_taken: "That signup link can no longer create an account. Please start again.",
  too_many_attempts: "Too many attempts. Please wait a minute and try again.",
};

const modeLabels: Record<AuthMode, string> = {
  login: "Log in",
  register: "Create account",
  recover: "Recover",
};

export function AuthScreen({ errorCode }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorCode ? errorCopy[errorCode] ?? "Sign-in failed." : "");
  const [message, setMessage] = useState("");
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading =
    mode === "login"
      ? "Welcome back."
      : mode === "register"
        ? "Create your Steady account."
        : "Recover your account.";
  const intro =
    mode === "login"
      ? "Open your private dashboard and continue from the last signal."
      : mode === "register"
        ? "Confirm your email before your account is created."
        : "Send a password reset link to the email on your account.";
  const submitLabel =
    mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Send reset link";

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setAuthUrl(null);
    setIsSubmitting(true);

    const endpoint =
      mode === "login"
        ? "/api/auth/login"
        : mode === "register"
          ? "/api/auth/register"
          : "/api/auth/recover";
    const payload =
      mode === "login"
        ? { email, password }
        : mode === "register"
          ? { email, password, username: username.trim() }
          : { email };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        resetUrl?: string | null;
        verificationUrl?: string | null;
      };

      if (!response.ok) {
        setError(data.error ?? "This could not be completed.");
        return;
      }

      if (mode === "login") {
        window.location.assign("/");
        return;
      }

      setMessage(data.message ?? "Check your email to verify your account.");
      setAuthUrl(data.verificationUrl ?? data.resetUrl ?? null);
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-zinc-50 sm:px-6 lg:px-8">
      <div className="ambient-shift pointer-events-none fixed left-[-4rem] top-16 h-64 w-64 rounded-full bg-[rgba(55,245,220,0.12)] blur-3xl" />
      <div className="ambient-shift pointer-events-none fixed right-[-3rem] top-8 h-72 w-72 rounded-full bg-[rgba(255,47,104,0.16)] blur-3xl [animation-delay:2s]" />

      <section className="mx-auto grid min-h-[calc(100svh-3rem)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <div className="reveal hidden lg:block">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Private steady space
          </div>
          <h1 className="mt-5 max-w-[34rem] text-6xl font-semibold leading-[0.96] tracking-tight">
            Keep your progress connected to you.
          </h1>
          <p className="mt-5 max-w-[31rem] text-base leading-7 text-zinc-400">
            Sign in to keep your practices, urge history, mood notes, and weekly patterns tied to
            one account.
          </p>

          <div className="mt-8 grid max-w-[34rem] grid-cols-3 gap-3">
            {[
              ["Protected", "Your dashboard stays account-specific."],
              ["Verified", "Email signup confirms ownership."],
              ["Fast", "Google sign-in works when configured."],
            ].map(([label, copy]) => (
              <article key={label} className="metric-tile rounded-[22px] p-4">
                <div className="text-sm font-semibold text-zinc-50">{label}</div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="reveal app-card grain-card mx-auto w-full max-w-[430px] rounded-[30px] p-5 sm:p-6">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#37f5dc_0%,#ff2f68_100%)] text-lg font-black text-[#07080a] shadow-[0_20px_50px_-28px_rgba(55,245,220,0.75)]">
                S
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight text-zinc-50">Steady</div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Account access
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-1.5 rounded-[18px] border border-white/10 bg-white/[0.045] p-1.5">
              {(["login", "register", "recover"] as const).map((nextMode) => {
                const active = mode === nextMode;

                return (
                  <button
                    key={nextMode}
                    type="button"
                    onClick={() => {
                      setMode(nextMode);
                      setError("");
                      setMessage("");
                      setAuthUrl(null);
                    }}
                    className={`pressable rounded-[14px] px-3 py-2.5 text-sm font-semibold ${
                      active ? "app-btn-primary" : "text-zinc-400 hover:bg-white/[0.055]"
                    }`}
                  >
                    {modeLabels[nextMode]}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50 lg:hidden">
                Keep your progress connected to you.
              </h1>
              <h2 className="hidden text-3xl font-semibold leading-tight tracking-tight text-zinc-50 lg:block">
                {heading}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {intro}
              </p>
            </div>

            {mode !== "recover" ? (
              <a
                href="/api/auth/google"
                className="pressable app-btn-secondary mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#101113]">
                  G
                </span>
                Continue with Google
              </a>
            ) : null}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Email
              </div>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form className="grid gap-3" onSubmit={submitAuth}>
              {mode === "register" ? (
                <label className="grid gap-2 text-sm font-medium text-zinc-300">
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="app-field rounded-[16px] px-4 py-3 text-zinc-50 placeholder:text-zinc-600"
                    placeholder="steadyname"
                    autoComplete="username"
                    required
                  />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-medium text-zinc-300">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="app-field rounded-[16px] px-4 py-3 text-zinc-50 placeholder:text-zinc-600"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  required
                />
              </label>

              {mode !== "recover" ? (
                <label className="grid gap-2 text-sm font-medium text-zinc-300">
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="app-field rounded-[16px] px-4 py-3 text-zinc-50 placeholder:text-zinc-600"
                    placeholder="At least 8 characters"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    type="password"
                    required
                  />
                </label>
              ) : null}

              {error ? (
                <div className="rounded-[18px] border border-[#ff2f68]/25 bg-[#ff2f68]/10 px-4 py-3 text-sm leading-6 text-[#ffc1d1]">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-[18px] border border-[#37f5dc]/20 bg-[#37f5dc]/10 px-4 py-3 text-sm leading-6 text-[#bffcf5]">
                  {message}
                  {authUrl ? (
                    <a
                      href={authUrl}
                      className="mt-3 block font-semibold text-zinc-50 underline decoration-white/30 underline-offset-4"
                    >
                      {mode === "recover" ? "Open reset link" : "Open verification link"}
                    </a>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="pressable app-btn-primary mt-2 min-h-12 rounded-[18px] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Working..." : submitLabel}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
