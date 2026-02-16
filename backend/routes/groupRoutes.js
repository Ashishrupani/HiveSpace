import express from 'express';

// Import authentication middleware //WIP -- haven't implemented yet but will do later
import { verifyAuth } from "../middleware/verifyAuth.js";
import { groupHomeHandler, findGroupHandler, createGroupHandler, getGroupDetailsHandler,  joinGroupHandler, leaveGroupHandler, getUserJoinedGroupsHandler, saveQuizHandler, getSavedQuizzesHandler} from '../controllers/groupControllers.js';


const router = express.Router();


// Route handler for group dashboard
router.post("/groupDashboard", verifyAuth, groupHomeHandler);

//Get groups list (search query for a specific group name) using ?find=groupname
router.get("/find", verifyAuth,findGroupHandler);

// Create a new group
router.post("/createGroup", verifyAuth, createGroupHandler);

//Get user's joined groups
router.post("/my-groups", verifyAuth, getUserJoinedGroupsHandler); //(shows the groups the user has joined)

// Save a quiz to a group (MUST COME BEFORE /:id route)
router.post("/:id/save-quiz", verifyAuth, saveQuizHandler);

// Get saved quizzes for a group (MUST COME BEFORE /:id route)
router.get("/:id/saved-quizzes", verifyAuth, getSavedQuizzesHandler);

// Join a group
router.post("/:id/join", verifyAuth,joinGroupHandler);

//Leave a joined group
router.post("/:id/leave", verifyAuth,leaveGroupHandler);

// Fetch group details by groupId (MUST COME LAST as it's generic /:id)
router.post("/:id", verifyAuth, getGroupDetailsHandler); //inner group details (shows the posts inside the group)


export default router;

