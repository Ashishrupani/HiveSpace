import StudySession from "../models/StudySession.js";
import { getChicagoDayKey, STUDY_TIMEZONE } from "../utils/studySession.js";


export const createSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { startTime, endTime, durationSec, groupId, mode } = req.body;

    if (!startTime || !endTime || !durationSec) {
      return res.status(400).json({ message: "startTime, endTime, durationSec are required." });
    }

    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(endTime);
    const parsedDurationSec = Number(durationSec);

    if (
      Number.isNaN(sessionStart.getTime()) ||
      Number.isNaN(sessionEnd.getTime()) ||
      !Number.isFinite(parsedDurationSec) ||
      parsedDurationSec <= 0
    ) {
      return res.status(400).json({ message: "Provide valid startTime, endTime, and durationSec values." });
    }

    if (sessionEnd < sessionStart) {
      return res.status(400).json({ message: "endTime must be greater than or equal to startTime." });
    }

    const dayKey = getChicagoDayKey(sessionStart);
    const childSession = {
      startTime: sessionStart,
      endTime: sessionEnd,
      durationSec: parsedDurationSec,
      groupId: groupId ?? null,
      mode: mode ?? "focus",
      createdAt: new Date(),
    };

    let dailySession = await StudySession.findOne({ userId, dayKey });

    if (!dailySession) {
      dailySession = new StudySession({
        userId,
        dayKey,
        timezone: STUDY_TIMEZONE,
        totalDurationSec: parsedDurationSec,
        sessionsCount: 1,
        firstSessionStart: sessionStart,
        lastSessionEnd: sessionEnd,
        sessions: [childSession],
      });
    } else {
      dailySession.timezone = STUDY_TIMEZONE;
      dailySession.totalDurationSec += parsedDurationSec;
      dailySession.sessionsCount += 1;
      dailySession.firstSessionStart = dailySession.firstSessionStart
        ? new Date(Math.min(dailySession.firstSessionStart.getTime(), sessionStart.getTime()))
        : sessionStart;
      dailySession.lastSessionEnd = dailySession.lastSessionEnd
        ? new Date(Math.max(dailySession.lastSessionEnd.getTime(), sessionEnd.getTime()))
        : sessionEnd;
      dailySession.sessions.push(childSession);
    }

    await dailySession.save();

    return res.status(201).json({ session: dailySession });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ message: "Failed to create session." });
  }
};
