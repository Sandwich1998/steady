import { NextResponse } from "next/server";

import { getTodayKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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
}
