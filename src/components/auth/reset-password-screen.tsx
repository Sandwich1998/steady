"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ResetPasswordScreenProps = {
  token?: string;
};

export function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "Reset link is missing a token.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset link is missing a token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "This reset link could not be used.");
        return;
      }

      window.location.assign("/");
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

      <section className="mx-auto grid min-h-[calc(100svh-3rem)] w-full max-w-[430px] items-center">
        <div className="reveal app-card grain-card w-full rounded-[30px] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#37f5dc_0%,#ff2f68_100%)] text-lg font-black text-[#07080a] shadow-[0_20px_50px_-28px_rgba(55,245,220,0.75)]">
              S
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight text-zinc-50">Steady</div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Password reset
              </div>
            </div>
          </div>

          <div className="mt-7">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
              Choose a new password.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              This will replace your current password and start a fresh session.
            </p>
          </div>

          <form className="mt-6 grid gap-3" onSubmit={submitReset}>
            <label className="grid gap-2 text-sm font-medium text-zinc-300">
              New password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="app-field rounded-[16px] px-4 py-3 text-zinc-50 placeholder:text-zinc-600"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                type="password"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-300">
              Confirm password
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="app-field rounded-[16px] px-4 py-3 text-zinc-50 placeholder:text-zinc-600"
                placeholder="Repeat password"
                autoComplete="new-password"
                type="password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-[18px] border border-[#ff2f68]/25 bg-[#ff2f68]/10 px-4 py-3 text-sm leading-6 text-[#ffc1d1]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="pressable app-btn-primary mt-2 min-h-12 rounded-[18px] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Working..." : "Reset password"}
            </button>
          </form>

          <a
            href="/login"
            className="mt-5 block text-center text-sm font-semibold text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-zinc-50"
          >
            Back to log in
          </a>
        </div>
      </section>
    </main>
  );
}
