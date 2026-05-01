import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isUrgeOutcome } from "@/lib/validation";
import { APP_TIME_ZONE } from "@/lib/date";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

function parseBoundedInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

    const rateLimit = checkRateLimit(getRateLimitKey(request, "urge-list"), 80, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const offset = parseBoundedInteger(searchParams.get("offset"), 0, 500);
    const limit = parseBoundedInteger(searchParams.get("limit"), 8, 24);

    const urges = await prisma.urgeLog.findMany({
      where: {
        habit: { userId: user.id },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: offset,
      take: limit,
      include: {
        habit: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({
      urges: urges.map((urge) => ({
        id: urge.id,
        habitName: urge.habit.name,
        habitType: urge.habit.type,
        intensity: urge.intensity,
        outcome: urge.outcome,
        createdAt: urge.createdAt.toISOString(),
        createdAtLabel: timeFormatter.format(urge.createdAt),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't load urge moments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

    const rateLimit = checkRateLimit(getRateLimitKey(request, "urge-create"), 25, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      habitId?: string;
      intensity?: number;
      outcome?: string;
    };

    const habitId = body.habitId;
    const intensity = body.intensity;
    const outcome = body.outcome;

    if (
      !habitId ||
      typeof intensity !== "number" ||
      !Number.isInteger(intensity) ||
      intensity < 1 ||
      intensity > 5 ||
      !outcome ||
      !isUrgeOutcome(outcome)
    ) {
      return NextResponse.json({ error: "Invalid urge payload." }, { status: 400 });
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: user.id,
      },
      select: { id: true, type: true },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    if (habit.type !== "BREAK") {
      return NextResponse.json(
        { error: "Urges can only be logged for break habits." },
        { status: 400 },
      );
    }

    const urgeLog = await prisma.urgeLog.create({
      data: {
        habitId,
        intensity,
        outcome,
      },
    });

    return NextResponse.json(urgeLog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't save this urge." }, { status: 500 });
  }
}
