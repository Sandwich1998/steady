import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);

export const AUTH_SESSION_COOKIE = "steady_session";
export const GOOGLE_OAUTH_STATE_COOKIE = "steady_google_state";

const SESSION_DAYS = 30;
const VERIFICATION_HOURS = 24;
const PASSWORD_RESET_MINUTES = 60;
const PASSWORD_KEY_LENGTH = 64;

type CurrentUser = {
  id: string;
  email: string;
  username: string;
  imageUrl: string | null;
  emailVerifiedAt: Date | null;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getCookieOptions(expires: Date) {
  return {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function createRandomToken() {
  return randomBytes(32).toString("base64url");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, key] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const storedKey = Buffer.from(key, "base64url");
  const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export async function hashToken(token: string) {
  return Promise.resolve(sha256(token));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = await hashToken(sessionToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          imageUrl: true,
          emailVerifiedAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session.user;
}

export async function createSession(userId: string) {
  const token = createRandomToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, token, getCookieOptions(expiresAt));

  return token;
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionToken) {
    const tokenHash = await hashToken(sessionToken);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  cookieStore.delete(AUTH_SESSION_COOKIE);
}

export async function createEmailVerificationToken(userId: string) {
  const token = createRandomToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  return token;
}

export function getAppOrigin(request: Request) {
  const configuredUrl = process.env.APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

export function getVerificationUrl(request: Request, token: string) {
  const url = new URL("/api/auth/verify", getAppOrigin(request));
  url.searchParams.set("token", token);
  return url.toString();
}

export function getPasswordResetUrl(request: Request, token: string) {
  const url = new URL("/reset-password", getAppOrigin(request));
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendVerificationEmail({
  email,
  username,
  verificationUrl,
}: {
  email: string;
  username: string;
  verificationUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      delivered: false,
      reason: "Email delivery is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Steady/1.0",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Verify your Steady account",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#151515">
          <h1 style="font-size:22px">Welcome to Steady, ${username}</h1>
          <p>Confirm your email to finish creating your account.</p>
          <p><a href="${verificationUrl}" style="color:#bd083f">Verify your account</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
      text: `Welcome to Steady, ${username}. Verify your account: ${verificationUrl}`,
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      reason: "The verification email could not be sent.",
    };
  }

  return { delivered: true, reason: null };
}

export async function createPasswordResetToken(userId: string) {
  const token = createRandomToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000);
  const now = new Date();

  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  return token;
}

export async function sendPasswordResetEmail({
  email,
  username,
  resetUrl,
}: {
  email: string;
  username: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      delivered: false,
      reason: "Email delivery is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Steady/1.0",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Reset your Steady password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#151515">
          <h1 style="font-size:22px">Reset your password, ${username}</h1>
          <p>Use this link to choose a new Steady password.</p>
          <p><a href="${resetUrl}" style="color:#bd083f">Reset your password</a></p>
          <p>This link expires in 60 minutes. If you did not request this, you can ignore it.</p>
        </div>
      `,
      text: `Reset your Steady password: ${resetUrl}`,
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      reason: "The password reset email could not be sent.",
    };
  }

  return { delivered: true, reason: null };
}

export function canShowDevVerificationLink(request?: Request) {
  if (process.env.AUTH_ALLOW_DEV_VERIFY_LINK !== "true") {
    return false;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!request) {
    return false;
  }

  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function createUniqueUsername(seed: string) {
  const cleaned = seed
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
  const base = cleaned.length >= 3 ? cleaned : "steady_user";

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? "" : `_${attempt + 1}`;
    const username = `${base}${suffix}`.slice(0, 24);
    const existing = await prisma.user.findUnique({
      where: { usernameKey: username },
      select: { id: true },
    });

    if (!existing) {
      return username;
    }
  }

  return `steady_${Date.now().toString(36)}`.slice(0, 24);
}
