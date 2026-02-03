import express from 'express';

// Import authentication middleware //WIP -- haven't implemented yet but will do later
import { requireAuth } from '@clerk/express';

import { groupHomeHandler, findGroupHandler, createGroupHandler, getGroupDetailsHandler,  joinGroupHandler, leaveGroupHandler, getUserJoinedGroupsHandler} from '../controllers/groupControllers.js';


const router = express.Router();


// Route handler for group dashboard
router.get("/groupDashboard", groupHomeHandler);

//Get groups list (search query for a specific group name) using ?find=groupname
router.get("/find", findGroupHandler);

// Create a new group
router.post("/createGroup", createGroupHandler);

// Fetch group details by groupId
router.get("/:id", getGroupDetailsHandler); //inner group details (shows the posts inside the group)

// Join a group
router.post("/:id/join", joinGroupHandler);

//Leave a joined group
router.post("/:id/leave", leaveGroupHandler);

//Get user's joined groups
router.get("/my-groups", getUserJoinedGroupsHandler); //(shows the groups the user has joined)


export default router;

