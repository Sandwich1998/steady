import { NextResponse } from "next/server";

import {
  canShowDevVerificationLink,
  createPasswordResetToken,
  getPasswordResetUrl,
  hashToken,
  sendPasswordResetEmail,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

const recoveryMessage =
  "If an account exists for that email, we'll send a password reset link.";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "auth-recover"), 8, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const showDevResetLink = canShowDevVerificationLink(request);

    if ((!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) && !showDevResetLink) {
      return NextResponse.json({ error: "Password recovery is not configured yet." }, { status: 503 });
    }

    const body = (await request.json()) as {
      email?: string;
    };
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });

    if (!user?.passwordHash || !user.emailVerifiedAt) {
      return NextResponse.json({ ok: true, message: recoveryMessage, resetUrl: null });
    }

    const token = await createPasswordResetToken(user.id);
    const resetUrl = getPasswordResetUrl(request, token);
    const delivery = await sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      resetUrl,
    });

    if (!delivery.delivered && !showDevResetLink) {
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash: await hashToken(token) } });
      return NextResponse.json(
        { error: delivery.reason ?? "The password reset email could not be sent." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: recoveryMessage,
      resetUrl: showDevResetLink ? resetUrl : null,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't start password recovery." }, { status: 500 });
  }
}
