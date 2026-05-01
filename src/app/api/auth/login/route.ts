import { NextResponse } from "next/server";

import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "auth-login"), 12, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });

    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 403 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't log you in." }, { status: 500 });
  }
}
