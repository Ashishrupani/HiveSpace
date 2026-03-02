// backend/controllers/streakController.js
import StudySession from "../models/StudySession.js";

/**
 * Streak rule:
 * A day counts if total study time >= 5 minutes (300 seconds) for that calendar day.
 */
export const getStreakStat = async (req, res) => {
  try {
    const userId = req.userId;
    const MIN_SECONDS = 300;

    // 1) Aggregate total seconds per day for this user
    // Note: If you want to handle local timezones, add { timezone: "Your/Timezone" } 
    // to the $dateToString operator.
    const days = await StudySession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startTime" }, 
          },
          totalSeconds: { $sum: "$durationSec" },
        },
      },
      { $match: { totalSeconds: { $gte: MIN_SECONDS } } },
      { $sort: { _id: 1 } }, // Ascending dates: "2026-03-01", "2026-03-02"
    ]);

    // Create a Set for O(1) lookups
    const qualifyingDates = new Set(days.map((d) => d._id));

    // Helper: subtract days from ISO date string
    const minusDays = (iso, n) => {
      const dt = new Date(iso + "T00:00:00.000Z");
      dt.setUTCDate(dt.getUTCDate() - n);
      return dt.toISOString().slice(0, 10);
    };

    // 2) Current streak: Logic fix
    const todayIso = new Date().toISOString().slice(0, 10);
    const yesterdayIso = minusDays(todayIso, 1);

    let currentStreak = 0;
    let startDateForCalculation = null;

    // Check if the user has qualified TODAY
    if (qualifyingDates.has(todayIso)) {
      startDateForCalculation = todayIso;
    } 
    // If not today, check if they qualified YESTERDAY to keep the streak alive
    else if (qualifyingDates.has(yesterdayIso)) {
      startDateForCalculation = yesterdayIso;
    }

    // If we have a valid starting point, count backwards
    if (startDateForCalculation) {
      while (qualifyingDates.has(minusDays(startDateForCalculation, currentStreak))) {
        currentStreak++;
      }
    }

    // 3) Personal best: Longest consecutive run
    let personalBest = 0;
    let currentRun = 0;

    for (let i = 0; i < days.length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const prevDate = new Date(days[i - 1]._id + "T00:00:00.000Z");
        const curDate = new Date(days[i]._id + "T00:00:00.000Z");
        
        // Calculate difference in days
        const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentRun++;
        } else {
          currentRun = 1;
        }
      }
      
      if (currentRun > personalBest) {
        personalBest = currentRun;
      }
    }

    return res.status(200).json({
      currentStreak,
      personalBest,
      minSecondsPerDay: MIN_SECONDS,
      // Debugging info (optional: remove for production)
      lastCalculated: todayIso,
      qualifiedDays: Array.from(qualifyingDates) 
    });

  } catch (err) {
    console.error("[getStreakStat]", err);
    return res.status(500).json({ message: "Failed to compute streak." });
  }
};