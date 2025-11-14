import express from 'express';
import { requireAuth } from '@clerk/express';
import { groupDashboardHandler, createGroupHandler, getGroupDetailsHandler } from '../controllers/groupControllers.js';

const router = express.Router();

// Clerk's middleware to protect routes
router.use(requireAuth());

// Route handler for group dashboard
router.get("/groupDashboard", groupDashboardHandler);
router.post("/createGroup", createGroupHandler);


// Fetch group details by groupId
router.get("/group/:groupId", getGroupDetailsHandler);




export default router;