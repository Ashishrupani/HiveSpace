import mongoose from "mongoose";
import { STUDY_TIMEZONE } from "../utils/studySession.js";

const childSessionSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationSec: { type: Number, required: true, min: 1 },
    groupId: { type: String, default: null },
    mode: { type: String, enum: ["focus", "break"], default: "focus" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false }
);

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Clerk userId
    dayKey: { type: String, required: true },
    timezone: { type: String, default: STUDY_TIMEZONE },
    totalDurationSec: { type: Number, required: true, default: 0, min: 0 },
    sessionsCount: { type: Number, required: true, default: 0, min: 0 },
    firstSessionStart: { type: Date, default: null },
    lastSessionEnd: { type: Date, default: null },
    sessions: { type: [childSessionSchema], default: [] },
  },
  { timestamps: true }
);

studySessionSchema.index(
  { userId: 1, dayKey: 1 },
  { unique: true, partialFilterExpression: { dayKey: { $exists: true } } }
);
studySessionSchema.index({ userId: 1, dayKey: 1, totalDurationSec: 1 });

export default mongoose.model("StudySession", studySessionSchema);
