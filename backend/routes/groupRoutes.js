import express from 'express';
import { requireAuth } from '@clerk/express';
import { groupDashboardHandler, createGroupHandler, getGroupDetailsHandler } from '../controllers/groupControllers.js';

const router = express.Router();


// Route handler for group dashboard
router.get("/groupDashboard", groupDashboardHandler);

// Create a new group
router.post("/createGroup", createGroupHandler);


// Fetch group details by groupId
router.get("/groups/:id", getGroupDetailsHandler); //inner group details (shows the posts inside the group)

// join a group
router.get("/groups/:id/join", null);

// leave a group
router.get("/groups/:id/leave", null);

// get user's joined groups
router.get("/groups/my-groups", null); //outer group details (shows the groups the user has joined)

// get all groups with optional search query
router.get("/groups", null);




export default router;


//WIP 
/*
GET    /groups                    # Get all groups (with optional ?q= search)
GET    /groups/:id                # Get single group details
POST   /groups/:id/join           # Join a group
POST   /groups/:id/leave          # Leave a group
POST   /groups                    # Create new group
GET    /groups/my-groups          # Get user's joined groups
 */