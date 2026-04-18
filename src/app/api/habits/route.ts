import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isHabitType } from "@/lib/validation";

export async function POST(request: Request) {
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

  const habit = await prisma.habit.create({
    data: {
      name,
      minimumAction,
      type,
    },
  });

  return NextResponse.json(habit, { status: 201 });
}
