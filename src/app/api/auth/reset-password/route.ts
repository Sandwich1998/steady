import { NextResponse } from "next/server";

import { createSession, hashPassword, hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, isValidPassword } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "auth-reset-password"), 8, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const token = body.token ?? "";
    const password = body.password ?? "";

    if (!token) {
      return NextResponse.json({ error: "Reset link is missing a token." }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const tokenHash = await hashToken(token);
    const passwordHash = await hashPassword(password);
    let userId: string;

    try {
      userId = await prisma.$transaction(async (tx) => {
        const resetToken = await tx.passwordResetToken.findUnique({
          where: { tokenHash },
          select: {
            id: true,
            expiresAt: true,
            usedAt: true,
            userId: true,
          },
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
          throw new Error("invalid_reset");
        }

        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        });
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash },
        });
        await tx.session.deleteMany({ where: { userId: resetToken.userId } });

        return resetToken.userId;
      });
    } catch {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }

    await createSession(userId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't reset your password." }, { status: 500 });
  }
}
