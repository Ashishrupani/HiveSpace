import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { getMonthlyStats, getWeeklyStats, getStreakStat } from "../controllers/statsController.js";
import { verify } from "node:crypto";

const router = express.Router();

// GET /api/stats/monthly?year=YYYY&month=MM
router.get("/monthly", verifyAuth, getMonthlyStats);
router.get("/weekly", verifyAuth, getWeeklyStats);
router.get("/streak", verifyAuth, getStreakStat);
export default router;