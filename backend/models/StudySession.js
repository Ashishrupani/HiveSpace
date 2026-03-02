import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Clerk userId
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationSec: { type: Number, required: true, min: 1 },

    // Optional (add later if you want)
    groupId: { type: String, default: null },
    mode: { type: String, enum: ["focus", "break"], default: "focus" },
  },
  { timestamps: true }
);

// Helpful index for queries by date range
studySessionSchema.index({ userId: 1, startTime: 1 });

export default mongoose.model("StudySession", studySessionSchema);