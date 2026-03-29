import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { debugMiddleware } from '../middleware/debug.js';
import { createGoalHandler, updateGoalHandler, 
         deleteGoalHandler, fetchGoalsHandler, 
         dashboardHandler} from '../controllers/homeControllers.js';

const router = express.Router();


//routes for home
// Goals - Create goal and update goal
router.post("/create-goal", verifyAuth, debugMiddleware, createGoalHandler);
router.post("/update-goal", verifyAuth, debugMiddleware, updateGoalHandler);

// Goals - Delete goal
router.post("/delete-goal", verifyAuth, debugMiddleware, deleteGoalHandler);

// Goals - Fetch goal
router.get("/fetch-goals", verifyAuth, debugMiddleware, fetchGoalsHandler);

// Grab all user data
router.get("/dashboard", verifyAuth, debugMiddleware, dashboardHandler);


export default router;