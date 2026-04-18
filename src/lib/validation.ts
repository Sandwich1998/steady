import { HabitType, UrgeOutcome } from "@prisma/client";

export function isHabitType(value: string): value is HabitType {
  return value === HabitType.BUILD || value === HabitType.BREAK;
}

export function isUrgeOutcome(value: string): value is UrgeOutcome {
  return value === UrgeOutcome.RESISTED || value === UrgeOutcome.ACTED;
}
