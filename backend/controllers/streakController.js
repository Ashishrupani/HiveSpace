// backend/controllers/streakController.js
import StudySession from "../models/StudySession.js";
import {
  buildDailyTotalsPipeline,
  computeStreaks,
  MIN_DAY_SECONDS,
  STUDY_TIMEZONE,
} from "../utils/studySession.js";

/**
 * Streak rule:
 * A day counts if total study time >= 5 minutes (300 seconds) for that calendar day.
 */
export const getStreakStat = async (req, res) => {
  try {
    const userId = req.userId;
    const days = await StudySession.aggregate(buildDailyTotalsPipeline(userId));

    const qualifyingDays = days
      .filter((day) => (day.totalDurationSec || 0) >= MIN_DAY_SECONDS)
      .map((day) => day._id);

    const { currentStreak, personalBest, todayDayKey } = computeStreaks(qualifyingDays, {
      allowPreviousDayCarry: true,
    });

    return res.status(200).json({
      currentStreak,
      personalBest,
      minSecondsPerDay: MIN_DAY_SECONDS,
      timezone: STUDY_TIMEZONE,
      lastCalculated: todayDayKey,
      qualifiedDays: qualifyingDays,
    });

  } catch (err) {
    console.error("[getStreakStat]", err);
    return res.status(500).json({ message: "Failed to compute streak." });
  }
};
