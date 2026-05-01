import { NextResponse } from "next/server";

import { createSession, hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function loginRedirect(request: Request, params: Record<string, string>) {
  const url = new URL("/login", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return loginRedirect(request, { error: "missing_verification" });
  }

  const tokenHash = await hashToken(token);
  const pendingRegistration = await prisma.pendingRegistration.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      username: true,
      usernameKey: true,
      passwordHash: true,
      expiresAt: true,
    },
  });

  if (pendingRegistration) {
    if (pendingRegistration.expiresAt <= new Date()) {
      await prisma.pendingRegistration.delete({ where: { id: pendingRegistration.id } });
      return loginRedirect(request, { error: "expired_verification" });
    }

    let userId: string;

    try {
      const user = await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findFirst({
          where: {
            OR: [{ email: pendingRegistration.email }, { usernameKey: pendingRegistration.usernameKey }],
          },
          select: { id: true },
        });

        if (existingUser) {
          throw new Error("registration_taken");
        }

        const createdUser = await tx.user.create({
          data: {
            email: pendingRegistration.email,
            username: pendingRegistration.username,
            usernameKey: pendingRegistration.usernameKey,
            passwordHash: pendingRegistration.passwordHash,
            emailVerifiedAt: new Date(),
          },
          select: { id: true },
        });

        await tx.pendingRegistration.delete({ where: { id: pendingRegistration.id } });

        return createdUser;
      });

      userId = user.id;
    } catch {
      return loginRedirect(request, { error: "registration_taken" });
    }

    await createSession(userId);

    const url = new URL("/", request.url);
    url.searchParams.set("verified", "1");
    return NextResponse.redirect(url);
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      usedAt: true,
      userId: true,
    },
  });

  if (!verificationToken || verificationToken.usedAt) {
    return loginRedirect(request, { error: "invalid_verification" });
  }

  if (verificationToken.expiresAt <= new Date()) {
    return loginRedirect(request, { error: "expired_verification" });
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  await createSession(verificationToken.userId);

  const url = new URL("/", request.url);
  url.searchParams.set("verified", "1");
  return NextResponse.redirect(url);
}
