import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  GOOGLE_OAUTH_STATE_COOKIE,
  createSession,
  createUniqueUsername,
  getAppOrigin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/validation";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function loginRedirect(request: Request, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect(request, "google_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return loginRedirect(request, "google_not_configured");
  }

  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return loginRedirect(request, "google_exchange");
  }

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenData.access_token) {
    return loginRedirect(request, "google_exchange");
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!profileResponse.ok) {
    return loginRedirect(request, "google_profile");
  }

  const profile = (await profileResponse.json()) as GoogleUserInfo;
  const email = normalizeEmail(profile.email ?? "");

  if (!profile.sub || !email || profile.email_verified === false) {
    return loginRedirect(request, "google_email");
  }

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: profile.sub,
      },
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (existingAccount) {
    await createSession(existingAccount.user.id);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const username = existingUser
    ? null
    : await createUniqueUsername(profile.name ?? email.split("@")[0] ?? "steady_user");
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        username: username ?? "steady_user",
        usernameKey: username ?? "steady_user",
        emailVerifiedAt: new Date(),
        imageUrl: profile.picture ?? null,
      },
      select: { id: true },
    }));

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerifiedAt: new Date(),
        imageUrl: profile.picture ?? undefined,
      },
    });
  }

  await prisma.oAuthAccount.create({
    data: {
      provider: "google",
      providerAccountId: profile.sub,
      userId: user.id,
    },
  });

  await createSession(user.id);

  return NextResponse.redirect(new URL("/", request.url));
}
