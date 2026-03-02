import StudySession from "../models/StudySession.js";


export const createSession = async (req, res) => {
  try {
    const { userId } = req.auth; // from your verifyAuth middleware
    const { startTime, endTime, durationSec, groupId, mode } = req.body;

    if (!startTime || !endTime || !durationSec) {
      return res.status(400).json({ message: "startTime, endTime, durationSec are required." });
    }

    const session = await StudySession.create({
      userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationSec: Number(durationSec),
      groupId: groupId ?? null,
      mode: mode ?? "focus",
    });

    return res.status(201).json({ session });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ message: "Failed to create session." });
  }
};