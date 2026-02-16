import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { createGoalHandler, updateGoalHandler, deleteGoalHandler, fetchGoalsHandler, dashboardHandler, profileHandler } from '../controllers/homeControllers.js';

const router = express.Router();


//routes for home
// Goals - Create goals and update goals
// router.get("/create-goal", verifyAuth, createGoalHandler);
// router.get("/update-goal", verifyAuth, updateGoalHandler);
// router.get("/delete-goal", verifyAuth, deleteGoalHandler);
// router.get("fetch-goals", verifyAuth, fetchGoalsHandler);

router.post("/create-goal", createGoalHandler);
router.post("/update-goal", updateGoalHandler);
router.post("/delete-goal", deleteGoalHandler);
router.get("/fetch-goals", fetchGoalsHandler);




router.get("/dashboard", dashboardHandler);
router.get("/profile", profileHandler);


export default router;