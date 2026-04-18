import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isUrgeOutcome } from "@/lib/validation";

export async function POST(request: Request) {
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

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { id: true, type: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  }

  if (habit.type !== "BREAK") {
    return NextResponse.json({ error: "Urges can only be logged for break habits." }, { status: 400 });
  }

  const urgeLog = await prisma.urgeLog.create({
    data: {
      habitId,
      intensity,
      outcome,
    },
  });

  return NextResponse.json(urgeLog, { status: 201 });
}
