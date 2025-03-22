import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// Get users for sidebar
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages for a chat
router.get("/:id", protectRoute, getMessages);

// Send a message (text or voice)
router.post("/send/:id", protectRoute, sendMessage);

export default router;