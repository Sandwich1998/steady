export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "UTC";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const zonedDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: APP_TIME_ZONE,
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: APP_TIME_ZONE,
});

function partsToRecord(parts: Intl.DateTimeFormatPart[]) {
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function formatPartsDateKey({ year, month, day }: DateParts) {
  return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
}

function formatUtcCalendarDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getZonedDateParts(date: Date): DateParts {
  const values = partsToRecord(dateKeyFormatter.formatToParts(date));

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

function parseDateKey(dateKey: string): DateParts {
  const [year, month, day] = dateKey.split("-").map(Number);

  return { year, month, day };
}

function getDateKeyDaysAgo(offsetDays: number) {
  const today = getZonedDateParts(new Date());
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day, 12));
  date.setUTCDate(date.getUTCDate() - offsetDays);

  return formatUtcCalendarDate(date);
}

function addDaysToDateKey(dateKey: string, days: number) {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  date.setUTCDate(date.getUTCDate() + days);

  return formatUtcCalendarDate(date);
}

function getTimeZoneOffsetMs(date: Date) {
  const values = partsToRecord(zonedDateTimeFormatter.formatToParts(date));
  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  dateKey: string,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
) {
  const { year, month, day } = parseDateKey(dateKey);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  let utcTime = utcGuess - getTimeZoneOffsetMs(new Date(utcGuess));
  utcTime = utcGuess - getTimeZoneOffsetMs(new Date(utcTime));

  return new Date(utcTime);
}

export function formatDateKey(date: Date) {
  return formatPartsDateKey(getZonedDateParts(date));
}

export function getDateDaysAgo(offsetDays: number) {
  return zonedDateTimeToUtc(getDateKeyDaysAgo(offsetDays));
}

export function getEndOfDateDaysAgo(offsetDays: number) {
  const nextDateKey = addDaysToDateKey(getDateKeyDaysAgo(offsetDays), 1);

  return new Date(zonedDateTimeToUtc(nextDateKey).getTime() - 1);
}

export function getRecentDateKeys(count: number, endOffsetDays = 0) {
  return Array.from({ length: count }, (_, index) => {
    const key = getDateKeyDaysAgo(endOffsetDays + (count - 1 - index));

    return {
      key,
      label: dayLabelFormatter.format(zonedDateTimeToUtc(key, 12)),
    };
  });
}

export function getTodayKey() {
  return getDateKeyDaysAgo(0);
}
