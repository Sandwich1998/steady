import { NextResponse } from "next/server";

import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "day-reset"), 20, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { mood?: number };
    const mood = body.mood;

    if (typeof mood !== "number" || !Number.isInteger(mood) || mood < 1 || mood > 5) {
      return NextResponse.json({ error: "Mood must be between 1 and 5." }, { status: 400 });
    }

    const dayReset = await prisma.dayReset.upsert({
      where: { date: getTodayKey() },
      update: { mood },
      create: {
        date: getTodayKey(),
        mood,
      },
    });

    return NextResponse.json(dayReset, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't save your check-in." }, { status: 500 });
  }
}
