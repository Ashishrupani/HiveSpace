import express from 'express';
import { debugMiddleware } from '../middleware/debug.js';
import { verifyAuth, verifyName } from "../middleware/verifyAuth.js";
import { groupHomeHandler, findGroupHandler, createGroupHandler, 
         updateGroupHandler, getGroupDetailsHandler,  joinGroupHandler, 
         leaveGroupHandler, getUserJoinedGroupsHandler, saveQuizHandler, 
         getSavedQuizzesHandler, saveSummaryHandler, getSavedSummariesHandler,
         getGroupLeaderboardHandler, createGroupGoalHandler, updateGroupGoalHandler, deleteGroupGoalHandler, fetchGroupGoalsHandler} 
from '../controllers/groupControllers.js';


const router = express.Router();


// Route handler for group dashboard
router.post("/groupDashboard", debugMiddleware, verifyAuth, groupHomeHandler);

//Get groups list (search query for a specific group name) using ?find=groupname
router.get("/find", debugMiddleware, verifyAuth, findGroupHandler);

// Create a new group
router.post("/createGroup", debugMiddleware, verifyAuth, createGroupHandler);

// Update group details (name/about/icon/color)
router.post("/updateGroup", debugMiddleware, verifyAuth, updateGroupHandler);

//Get user's joined groups
router.post("/my-groups", debugMiddleware, verifyAuth, getUserJoinedGroupsHandler); //(shows the groups the user has joined)

router.post("/create-goal", verifyAuth, debugMiddleware, createGroupGoalHandler);
router.post("/update-goal", verifyAuth, debugMiddleware, updateGroupGoalHandler);
// Goals - Delete goal
router.post("/delete-goal", verifyAuth, debugMiddleware, deleteGroupGoalHandler);
// Goals - Fetch goal
router.post("/fetch-goals", verifyAuth, debugMiddleware, fetchGroupGoalsHandler);

// Save a quiz to a group (MUST COME BEFORE /:id route)
router.post("/:id/save-quiz", debugMiddleware, verifyName, saveQuizHandler);

// Save a summary to a group (MUST COME BEFORE /:id route)
router.post("/:id/save-summary", debugMiddleware, verifyName, saveSummaryHandler);

// Get saved quizzes for a group (MUST COME BEFORE /:id route)
router.get("/:id/saved-quizzes", debugMiddleware, verifyName, getSavedQuizzesHandler);

// Get saved summaries for a group (MUST COME BEFORE /:id route)
router.get("/:id/saved-summaries", debugMiddleware, verifyName, getSavedSummariesHandler);

// Get leaderboard for a group (placeholder until websocket is integrated)
router.get("/:id/leaderboard", debugMiddleware, verifyName, getGroupLeaderboardHandler);

// Join a group
router.post("/:id/join", debugMiddleware, verifyAuth, joinGroupHandler);

//Leave a joined group
router.post("/:id/leave", debugMiddleware, verifyAuth, leaveGroupHandler);

// Fetch group details by groupId (MUST COME LAST as it's generic /:id)
router.post("/:id", debugMiddleware, verifyAuth, getGroupDetailsHandler); //inner group details (shows the posts inside the group)


export default router;

