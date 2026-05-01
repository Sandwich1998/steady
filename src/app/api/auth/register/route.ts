import { NextResponse } from "next/server";

import {
  canShowDevVerificationLink,
  createRandomToken,
  getVerificationUrl,
  hashPassword,
  hashToken,
  sendVerificationEmail,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeEmail,
  normalizeUsernameKey,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "auth-register"), 8, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const showDevVerificationLink = canShowDevVerificationLink(request);

    if ((!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) && !showDevVerificationLink) {
      return NextResponse.json(
        { error: "Email verification is not configured yet." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      username?: string;
    };

    const email = normalizeEmail(body.email ?? "");
    const username = body.username?.trim() ?? "";
    const usernameKey = normalizeUsernameKey(username);
    const password = body.password ?? "";

    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error: `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters using letters, numbers, or underscores.`,
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    await prisma.pendingRegistration.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });

    const [existingEmailUser, existingUsernameUser, pendingEmail, pendingUsername] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { email },
          select: { id: true },
        }),
        prisma.user.findUnique({
          where: { usernameKey },
          select: { id: true },
        }),
        prisma.pendingRegistration.findUnique({
          where: { email },
          select: { id: true, email: true },
        }),
        prisma.pendingRegistration.findUnique({
          where: { usernameKey },
          select: { id: true, email: true },
        }),
      ]);

    if (existingEmailUser) {
      return NextResponse.json(
        { error: "An account already exists for this email." },
        { status: 409 },
      );
    }

    if (existingUsernameUser || (pendingUsername && pendingUsername.email !== email)) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    const token = createRandomToken();
    const tokenHash = await hashToken(token);
    const passwordHash = await hashPassword(password);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pendingRegistration = pendingEmail
      ? await prisma.pendingRegistration.update({
          where: { id: pendingEmail.id },
          data: {
            username,
            usernameKey,
            passwordHash,
            tokenHash,
            expiresAt,
          },
          select: { id: true, email: true, username: true },
        })
      : await prisma.pendingRegistration.create({
          data: {
            email,
            username,
            usernameKey,
            passwordHash,
            tokenHash,
            expiresAt,
          },
          select: { id: true, email: true, username: true },
        });

    const verificationUrl = getVerificationUrl(request, token);
    const delivery = await sendVerificationEmail({
      email: pendingRegistration.email,
      username: pendingRegistration.username,
      verificationUrl,
    });

    if (!delivery.delivered && !showDevVerificationLink) {
      await prisma.pendingRegistration.delete({ where: { id: pendingRegistration.id } });
      return NextResponse.json(
        { error: delivery.reason ?? "The verification email could not be sent." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: delivery.delivered
        ? "Check your email to confirm and finish creating your account."
        : "Confirm your email to finish creating your account.",
      verificationUrl: showDevVerificationLink ? verificationUrl : null,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't create your account." }, { status: 500 });
  }
}
