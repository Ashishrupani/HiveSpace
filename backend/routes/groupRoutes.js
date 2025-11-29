import express from 'express';
import { requireAuth } from '@clerk/express';
import { groupDashboardHandler, createGroupHandler, getGroupDetailsHandler } from '../controllers/groupControllers.js';

const router = express.Router();


// Route handler for group dashboard
router.get("/groupDashboard", groupDashboardHandler);
router.post("/createGroup", createGroupHandler);


// Fetch group details by groupId
router.get("/group/:groupId", getGroupDetailsHandler);




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