import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String, // Translated or converted text
    },
    originalText: {
      type: String, // Original text (for translation purposes)
    },
    image: {
      type: String, // URL of the image (if any)
    },
    audio: {
      type: String, // URL of the audio file (if any)
    },
    isVoiceMessage: {
      type: Boolean,
      default: false, // Indicates if it's a voice message
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message = mongoose.model("Message", messageSchema);

export default Message;