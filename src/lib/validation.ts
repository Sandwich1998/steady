import { HabitType, UrgeOutcome } from "@prisma/client";

export const HABIT_NAME_MAX_LENGTH = 80;
export const HABIT_MINIMUM_ACTION_MAX_LENGTH = 160;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

const usernamePattern = /^[a-zA-Z0-9_]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeUsernameKey(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  const normalized = normalizeEmail(value);
  return normalized.length <= 254 && emailPattern.test(normalized);
}

export function isValidUsername(value: string) {
  const trimmed = value.trim();
  return (
    trimmed.length >= USERNAME_MIN_LENGTH &&
    trimmed.length <= USERNAME_MAX_LENGTH &&
    usernamePattern.test(trimmed)
  );
}

export function isValidPassword(value: string) {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}
