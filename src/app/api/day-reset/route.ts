import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

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

    const today = getTodayKey();
    const dayReset = await prisma.$transaction(async (tx) => {
      const existing = await tx.dayReset.findFirst({
        where: {
          userId: user.id,
          date: today,
        },
        select: { id: true },
      });

      if (existing) {
        return tx.dayReset.update({
          where: { id: existing.id },
          data: { mood },
        });
      }

      return tx.dayReset.create({
        data: {
          date: today,
          mood,
          userId: user.id,
        },
      });
    });

    return NextResponse.json(dayReset, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't save your check-in." }, { status: 500 });
  }
}
