import { HabitType, UrgeOutcome } from "@prisma/client";

export const HABIT_NAME_MAX_LENGTH = 80;
export const HABIT_MINIMUM_ACTION_MAX_LENGTH = 160;

export function isHabitType(value: string): value is HabitType {
  return value === HabitType.BUILD || value === HabitType.BREAK;
}

export function isUrgeOutcome(value: string): value is UrgeOutcome {
  return value === UrgeOutcome.RESISTED || value === UrgeOutcome.ACTED;
}

export function isValidHabitName(value: string) {
  return value.length > 0 && value.length <= HABIT_NAME_MAX_LENGTH;
}

export function isValidMinimumAction(value: string) {
  return value.length > 0 && value.length <= HABIT_MINIMUM_ACTION_MAX_LENGTH;
}
