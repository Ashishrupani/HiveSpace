import dotenv from "dotenv";
import mongoose from "mongoose";
import StudySession from "../models/StudySession.js";
import { getChicagoDayKey, STUDY_TIMEZONE } from "../utils/studySession.js";

dotenv.config();

function buildLegacyGroups(legacySessions) {
  const groups = new Map();

  for (const session of legacySessions) {
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    const durationSec = Number(session.durationSec) || 0;
    const dayKey = getChicagoDayKey(sessionStart);
    const mapKey = `${session.userId}::${dayKey}`;

    if (!groups.has(mapKey)) {
      groups.set(mapKey, {
        userId: session.userId,
        dayKey,
        timezone: STUDY_TIMEZONE,
        totalDurationSec: 0,
        sessionsCount: 0,
        firstSessionStart: sessionStart,
        lastSessionEnd: sessionEnd,
        sessions: [],
        legacyIds: [],
      });
    }

    const group = groups.get(mapKey);
    group.totalDurationSec += durationSec;
    group.sessionsCount += 1;
    group.firstSessionStart = new Date(Math.min(group.firstSessionStart.getTime(), sessionStart.getTime()));
    group.lastSessionEnd = new Date(Math.max(group.lastSessionEnd.getTime(), sessionEnd.getTime()));
    group.sessions.push({
      startTime: sessionStart,
      endTime: sessionEnd,
      durationSec,
      groupId: session.groupId ?? null,
      mode: session.mode ?? "focus",
      createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
    });
    group.legacyIds.push(session._id);
  }

  return [...groups.values()];
}

async function migrate() {
  if (!process.env.MONGO_DB_URI) {
    throw new Error("MONGO_DB_URI is not set.");
  }

  await mongoose.connect(process.env.MONGO_DB_URI);

  const collection = mongoose.connection.collection("studysessions");
  const legacySessions = await collection.find({
    dayKey: { $exists: false },
    startTime: { $exists: true },
    endTime: { $exists: true },
    durationSec: { $exists: true },
  }).toArray();

  if (legacySessions.length === 0) {
    console.log("No legacy study sessions found.");
    await mongoose.disconnect();
    return;
  }

  const groups = buildLegacyGroups(legacySessions);
  let migratedGroupCount = 0;
  let migratedSessionCount = 0;

  for (const group of groups) {
    let dailySession = await StudySession.findOne({
      userId: group.userId,
      dayKey: group.dayKey,
    });

    if (!dailySession) {
      dailySession = new StudySession({
        userId: group.userId,
        dayKey: group.dayKey,
        timezone: group.timezone,
        totalDurationSec: group.totalDurationSec,
        sessionsCount: group.sessionsCount,
        firstSessionStart: group.firstSessionStart,
        lastSessionEnd: group.lastSessionEnd,
        sessions: group.sessions,
      });
    } else {
      dailySession.timezone = STUDY_TIMEZONE;
      dailySession.totalDurationSec += group.totalDurationSec;
      dailySession.sessionsCount += group.sessionsCount;
      dailySession.firstSessionStart = dailySession.firstSessionStart
        ? new Date(Math.min(dailySession.firstSessionStart.getTime(), group.firstSessionStart.getTime()))
        : group.firstSessionStart;
      dailySession.lastSessionEnd = dailySession.lastSessionEnd
        ? new Date(Math.max(dailySession.lastSessionEnd.getTime(), group.lastSessionEnd.getTime()))
        : group.lastSessionEnd;
      dailySession.sessions.push(...group.sessions);
    }

    await dailySession.save();
    await collection.deleteMany({ _id: { $in: group.legacyIds } });

    migratedGroupCount += 1;
    migratedSessionCount += group.legacyIds.length;
  }

  console.log(`Migrated ${migratedSessionCount} legacy sessions into ${migratedGroupCount} daily documents.`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error("Study session migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
