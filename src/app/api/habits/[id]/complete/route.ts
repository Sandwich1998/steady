import { NextResponse } from "next/server";

import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "habit-complete"), 40, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const { id } = await context.params;
    const today = getTodayKey();

    const habit = await prisma.habit.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    const completion = await prisma.$transaction(async (tx) => {
      await tx.habitRestDay.deleteMany({
        where: {
          habitId: id,
          date: today,
        },
      });

      return tx.habitCompletion.upsert({
        where: {
          habitId_date: {
            habitId: id,
            date: today,
          },
        },
        update: {},
        create: {
          habitId: id,
          date: today,
        },
      });
    });

    return NextResponse.json(completion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't save that completion." }, { status: 500 });
  }
}
