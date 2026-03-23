import express from "express";
import { createSession } from "../controllers/sessionController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

// POST /api/sessions
router.post("/", verifyAuth, createSession);

export default router;