import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { createGoalHandler, updateGoalHandler, 
         deleteGoalHandler, fetchGoalsHandler, 
         dashboardHandler} from '../controllers/homeControllers.js';

const router = express.Router();


//routes for home
// Goals - Create goal and update goal
router.post("/create-goal", verifyAuth, createGoalHandler);
router.post("/update-goal", verifyAuth, updateGoalHandler);

// Goals - Delete goal
router.post("/delete-goal", verifyAuth, deleteGoalHandler);

// Goals - Fetch goal
router.get("fetch-goals", verifyAuth, fetchGoalsHandler);

// Grab all user data
router.get("/dashboard", dashboardHandler);


export default router;