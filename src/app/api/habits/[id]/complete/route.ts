import { NextResponse } from "next/server";

import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;

  const habit = await prisma.habit.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  }

  const completion = await prisma.habitCompletion.upsert({
    where: {
      habitId_date: {
        habitId: id,
        date: getTodayKey(),
      },
    },
    update: {},
    create: {
      habitId: id,
      date: getTodayKey(),
    },
  });

  return NextResponse.json(completion, { status: 201 });
}
