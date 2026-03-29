import StudySession from "../models/StudySession.js";
import {
  buildDailyTotalsPipeline,
  computeStreaks,
  getMonthBounds,
  getWeekBounds,
  MIN_DAY_SECONDS,
  STUDY_TIMEZONE,
} from "../utils/studySession.js";

/**
 * GET /api/stats/monthly?year=2026&month=3
 * Returns total study seconds per day for that month.
 *
 * month = 1..12
 */
export const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 1-12

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Provide valid year and month (1-12)." });
    }

    const { startDayKey, endDayKeyExclusive } = getMonthBounds(year, month);
    const rows = await StudySession.aggregate(
      buildDailyTotalsPipeline(userId, { $gte: startDayKey, $lt: endDayKeyExclusive })
    );

    const data = rows.map((row) => ({
      date: row._id,
      totalSeconds: row.totalDurationSec || 0,
      sessionsCount: row.sessionsCount || 0,
    }));

    return res.status(200).json({
      year,
      month,
      timezone: STUDY_TIMEZONE,
      days: data,
    });
  } catch (err) {
    console.error("getMonthlyStats error:", err);
    return res.status(500).json({ message: "Failed to fetch monthly stats." });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { weekStartDayKey, weekEndDayKeyInclusive } = getWeekBounds();

    const dailySessions = await StudySession.aggregate(
      buildDailyTotalsPipeline(userId, { $gte: weekStartDayKey, $lte: weekEndDayKeyInclusive })
    );

    const weeklyTotalSec = dailySessions.reduce((sum, session) => sum + (session.totalDurationSec || 0), 0);

    return res.status(200).json({
      weeklyTotalSec,
      timezone: STUDY_TIMEZONE,
      weekStartDayKey,
      weekEndDayKey: weekEndDayKeyInclusive,
    });
  } catch (err) {
    console.error("getWeeklyStats error:", err);
    return res.status(500).json({ message: "Failed to fetch weekly stats." });
  }
};

export const getStreakStat = async (req, res) => {
  try {
    const userId = req.userId;
    const daily = await StudySession.aggregate(buildDailyTotalsPipeline(userId));

    const qualifiedDays = daily
      .filter((day) => (day.totalDurationSec || 0) >= MIN_DAY_SECONDS)
      .map((day) => day._id);

    const { currentStreak, personalBest } = computeStreaks(qualifiedDays, {
      allowPreviousDayCarry: true,
    });

    return res.status(200).json({
      success: true,
      minSecondsPerDay: MIN_DAY_SECONDS,
      currentStreak,
      personalBest,
      timezone: STUDY_TIMEZONE,
    });
  } catch (err) {
    console.error("[getStreakStat]", err);
    return res.status(500).json({ success: false, message: "Failed to compute streak" });
  }
};
