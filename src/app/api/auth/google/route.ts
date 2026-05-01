import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { GOOGLE_OAUTH_STATE_COOKIE, createRandomToken, getAppOrigin } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(request, "auth-google"), 12, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL("/login?error=too_many_attempts", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  const origin = getAppOrigin(request);
  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = createRandomToken();
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(url);
}
