export const STUDY_TIMEZONE = "America/Chicago";
export const MIN_DAY_SECONDS = 5 * 60;

const chicagoFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDY_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function getChicagoDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = chicagoFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to derive Chicago day key.");
  }

  return `${year}-${month}-${day}`;
}

export function shiftDayKey(dayKey, offsetDays) {
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function getMonthBounds(year, month) {
  const startDayKey = `${year}-${pad2(month)}-01`;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endDayKeyExclusive = `${nextMonthYear}-${pad2(nextMonth)}-01`;

  return { startDayKey, endDayKeyExclusive };
}

export function getWeekBounds(referenceDate = new Date()) {
  const todayDayKey = getChicagoDayKey(referenceDate);
  const todayDate = new Date(`${todayDayKey}T00:00:00.000Z`);
  const weekStartDayKey = shiftDayKey(todayDayKey, -todayDate.getUTCDay());
  const weekEndDayKeyInclusive = shiftDayKey(weekStartDayKey, 6);

  return { todayDayKey, weekStartDayKey, weekEndDayKeyInclusive };
}

export function buildDailyTotalsPipeline(userId, dayKeyMatch = null) {
  const pipeline = [
    { $match: { userId } },
    {
      $project: {
        dayKey: {
          $ifNull: [
            "$dayKey",
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$startTime",
                timezone: STUDY_TIMEZONE,
              },
            },
          ],
        },
        totalDurationSec: { $ifNull: ["$totalDurationSec", "$durationSec"] },
        sessionsCount: { $ifNull: ["$sessionsCount", 1] },
      },
    },
  ];

  if (dayKeyMatch) {
    pipeline.push({ $match: { dayKey: dayKeyMatch } });
  }

  pipeline.push(
    {
      $group: {
        _id: "$dayKey",
        totalDurationSec: { $sum: "$totalDurationSec" },
        sessionsCount: { $sum: "$sessionsCount" },
      },
    },
    { $sort: { _id: 1 } }
  );

  return pipeline;
}

export function computeStreaks(qualifiedDayKeys, options = {}) {
  const { allowPreviousDayCarry = true, referenceDate = new Date() } = options;
  const set = new Set(qualifiedDayKeys);
  const { todayDayKey } = getWeekBounds(referenceDate);
  const startDayKey = set.has(todayDayKey)
    ? todayDayKey
    : allowPreviousDayCarry && set.has(shiftDayKey(todayDayKey, -1))
      ? shiftDayKey(todayDayKey, -1)
      : null;

  let currentStreak = 0;
  if (startDayKey) {
    while (set.has(shiftDayKey(startDayKey, -currentStreak))) {
      currentStreak += 1;
    }
  }

  let personalBest = 0;
  let currentRun = 0;

  for (let i = 0; i < qualifiedDayKeys.length; i += 1) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prevDayKey = qualifiedDayKeys[i - 1];
      const currentDayKey = qualifiedDayKeys[i];
      currentRun = shiftDayKey(prevDayKey, 1) === currentDayKey ? currentRun + 1 : 1;
    }

    personalBest = Math.max(personalBest, currentRun);
  }

  return { currentStreak, personalBest, todayDayKey };
}
