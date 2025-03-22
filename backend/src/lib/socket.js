import { Server } from "socket.io";
import http from "http";
import express from "express";
import { translateText } from "./translate.js"; // Import the translation utility
import User from "../models/user.model.js"; // Import the User model

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for new messages
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      // Fetch recipient's language preference
      const receiver = await User.findById(receiverId);
      const targetLanguage = receiver.language;

      // Translate the message
      const translatedText = await translateText(text, targetLanguage);

      // Get the recipient's socket ID
      const receiverSocketId = getReceiverSocketId(receiverId);

      if (receiverSocketId) {
        // Emit the translated message to the recipient
        io.to(receiverSocketId).emit("receiveMessage", {
          senderId,
          text: translatedText,
          originalText: text, // Optional: Include the original text
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };