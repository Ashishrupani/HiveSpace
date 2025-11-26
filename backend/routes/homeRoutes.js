import express from 'express';
import { requireAuth } from '@clerk/express';
import { dashboardHandler, profileHandler } from '../controllers/homeControllers.js';

const router = express.Router();

// Clerk's middleware to protect routes

//routes for home
router.get("/dashboard", dashboardHandler);
router.get("/profile", profileHandler);


export default router;