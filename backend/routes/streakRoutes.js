// backend/routes/streakRoutes.js
import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { getStreakStat } from "../controllers/streakController.js";

const router = express.Router();

router.get("/", verifyAuth, getStreakStat);

export default router;