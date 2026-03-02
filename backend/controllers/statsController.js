import StudySession from "../models/StudySession.js";

/**
 * GET /api/stats/monthly?year=2026&month=3
 * Returns total study seconds per day for that month.
 *
 * month = 1..12
 */
export const getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.auth;
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 1-12

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Provide valid year and month (1-12)." });
    }

    // Date range [start, end)
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    // Aggregate total duration per day (in America/Chicago)
    const tz = "America/Chicago";

    const rows = await StudySession.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$startTime",
              timezone: tz,
            },
          },
          totalSeconds: { $sum: "$durationSec" },
          sessionsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert to nicer shape for frontend
    const data = rows.map((r) => ({
      date: r._id,                 // "YYYY-MM-DD"
      totalSeconds: r.totalSeconds,
      sessionsCount: r.sessionsCount,
    }));

    return res.status(200).json({
      year,
      month,
      timezone: tz,
      days: data,
    });
  } catch (err) {
    console.error("getMonthlyStats error:", err);
    return res.status(500).json({ message: "Failed to fetch monthly stats." });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const { userId } = req.auth;

    const now = new Date();

    // Start of week (Sunday) in local time
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);

    // End = now (or end of week if you want)
    const sessions = await StudySession.find({
      userId,
      startTime: { $gte: start, $lte: now },
    }).select("durationSec");

    const weeklyTotalSec = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);

    return res.status(200).json({ weeklyTotalSec });
  } catch (err) {
    console.error("getWeeklyStats error:", err);
    return res.status(500).json({ message: "Failed to fetch weekly stats." });
  }
};

const MIN_DAY_SECONDS = 5 * 60;

function toISODateUTC(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function computeStreaks(qualifiedDateStrings) {
  // qualifiedDateStrings: ["2026-03-01", "2026-03-02", ...] sorted asc
  const set = new Set(qualifiedDateStrings);

  // current streak ends today (UTC)
  let current = 0;
  let cursor = new Date(); // now
  let cursorStr = toISODateUTC(cursor);

  while (set.has(cursorStr)) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    cursorStr = toISODateUTC(cursor);
  }

  // personal best: longest run
  let best = 0;
  let run = 0;
  for (let i = 0; i < qualifiedDateStrings.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(qualifiedDateStrings[i - 1] + "T00:00:00.000Z");
      const cur = new Date(qualifiedDateStrings[i] + "T00:00:00.000Z");
      const diffDays = (cur - prev) / (1000 * 60 * 60 * 24);

      run = diffDays === 1 ? run + 1 : 1;
    }
    best = Math.max(best, run);
  }

  return { currentStreak: current, personalBest: best };
}

export const getStreakStat = async (req, res) => {
  try {
    const userId = req.userId; // from verifyAuth middleware

    // Group sessions by day (UTC) and sum durationSec
    const daily = await StudySession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startTime" }, // UTC by default
          },
          totalSeconds: { $sum: "$durationSec" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const qualifiedDays = daily
      .filter((d) => (d.totalSeconds || 0) >= MIN_DAY_SECONDS)
      .map((d) => d._id);

    const { currentStreak, personalBest } = computeStreaks(qualifiedDays);

    return res.status(200).json({
      success: true,
      minSecondsPerDay: MIN_DAY_SECONDS,
      currentStreak,
      personalBest,
    });
  } catch (err) {
    console.error("[getStreakStat]", err);
    return res.status(500).json({ success: false, message: "Failed to compute streak" });
  }
};