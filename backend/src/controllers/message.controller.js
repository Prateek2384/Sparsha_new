import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { translateText } from '../lib/translate.js'; // Import the translation utility
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, isVoiceMessage } = req.body; // Add isVoiceMessage flag
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Fetch receiver's language preference
    const receiver = await User.findById(receiverId);
    const targetLanguage = receiver.language || 'en'; // Default to English if not set

    // Translate the message text (if text exists and it's not a voice message)
    let translatedText = text;
    if (text && !isVoiceMessage) {
      translatedText = await translateText(text, targetLanguage);
    }

    // Save the message in the database
    const newMessage = new Message({
      senderId,
      receiverId,
      text: translatedText, // Store the translated text
      originalText: text, // Optionally store the original text
      image: imageUrl,
      isVoiceMessage, // Indicate if it's a voice message
    });

    await newMessage.save();

    // Emit the message to the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toObject(), // Convert Mongoose document to plain object
        originalText: text, // Include original text for reference
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};