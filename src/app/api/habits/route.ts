import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import {
  HABIT_MINIMUM_ACTION_MAX_LENGTH,
  HABIT_NAME_MAX_LENGTH,
  isHabitType,
  isValidHabitName,
  isValidMinimumAction,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(request, "habit-create"), 15, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      minimumAction?: string;
      type?: string;
    };

    const name = body.name?.trim();
    const minimumAction = body.minimumAction?.trim();
    const type = body.type;

    if (!name || !minimumAction || !type || !isHabitType(type)) {
      return NextResponse.json({ error: "Invalid habit payload." }, { status: 400 });
    }

    if (!isValidHabitName(name)) {
      return NextResponse.json(
        { error: `Name must be between 1 and ${HABIT_NAME_MAX_LENGTH} characters.` },
        { status: 400 },
      );
    }

    if (!isValidMinimumAction(minimumAction)) {
      return NextResponse.json(
        {
          error: `Minimum step must be between 1 and ${HABIT_MINIMUM_ACTION_MAX_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        minimumAction,
        type,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't save this practice." }, { status: 500 });
  }
}
