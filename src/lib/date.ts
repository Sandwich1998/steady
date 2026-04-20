export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "UTC";

function toUtcDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateDaysAgo(offsetDays: number) {
  const date = toUtcDate(new Date());
  date.setUTCDate(date.getUTCDate() - offsetDays);
  return date;
}

export function getRecentDateKeys(count: number, endOffsetDays = 0) {
  return Array.from({ length: count }, (_, index) => {
    const date = getDateDaysAgo(endOffsetDays + (count - 1 - index));

    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: APP_TIME_ZONE,
      }),
    };
  });
}

export function getTodayKey() {
  return formatDateKey(getDateDaysAgo(0));
}
