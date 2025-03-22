import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

// Update user's language preference
router.put("/update-language", async (req, res) => {
    const { userId, language } = req.body;

    if (!userId || !language) {
        return res.status(400).json({ success: false, message: "User ID and language are required." });
    }

    try {
        const user = await User.findByIdAndUpdate(userId, { language }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: "Language preference updated." });
    } catch (error) {
        console.error("Error updating language:", error);
        res.status(500).json({ success: false, message: "Failed to update language preference." });
    }
});

export default router;
