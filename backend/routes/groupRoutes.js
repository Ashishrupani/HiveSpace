import express from 'express';
import { debugMiddleware } from '../middleware/debug.js';
// Import authentication middleware //WIP -- haven't implemented yet but will do later
import { verifyAuth } from "../middleware/verifyAuth.js";
import { groupHomeHandler, findGroupHandler, createGroupHandler, getGroupDetailsHandler,  joinGroupHandler, leaveGroupHandler, getUserJoinedGroupsHandler, saveQuizHandler, getSavedQuizzesHandler} from '../controllers/groupControllers.js';


const router = express.Router();


// Route handler for group dashboard
router.post("/groupDashboard", debugMiddleware, verifyAuth, groupHomeHandler);

//Get groups list (search query for a specific group name) using ?find=groupname
router.get("/find", debugMiddleware, verifyAuth, findGroupHandler);

// Create a new group
router.post("/createGroup", debugMiddleware, verifyAuth, createGroupHandler);

//Get user's joined groups
router.post("/my-groups", debugMiddleware, verifyAuth, getUserJoinedGroupsHandler); //(shows the groups the user has joined)

// Save a quiz to a group (MUST COME BEFORE /:id route)
router.post("/:id/save-quiz", debugMiddleware, verifyAuth, saveQuizHandler);

// Get saved quizzes for a group (MUST COME BEFORE /:id route)
router.get("/:id/saved-quizzes", debugMiddleware, verifyAuth, getSavedQuizzesHandler);

// Join a group
router.post("/:id/join", debugMiddleware, verifyAuth, joinGroupHandler);

//Leave a joined group
router.post("/:id/leave", debugMiddleware, verifyAuth, leaveGroupHandler);

// Fetch group details by groupId (MUST COME LAST as it's generic /:id)
router.post("/:id", debugMiddleware, verifyAuth, getGroupDetailsHandler); //inner group details (shows the posts inside the group)


export default router;

