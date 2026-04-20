import { NextResponse } from "next/server";

import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const today = getTodayKey();

  const habit = await prisma.habit.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found." }, { status: 404 });
  }

  const restDay = await prisma.$transaction(async (tx) => {
    await tx.habitCompletion.deleteMany({
      where: {
        habitId: id,
        date: today,
      },
    });

    return tx.habitRestDay.upsert({
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

  return NextResponse.json(restDay, { status: 201 });
}
