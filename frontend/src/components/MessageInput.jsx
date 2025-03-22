import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Mic } from "lucide-react"; // Import Mic icon
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isListening, setIsListening] = useState(false); // State for voice recognition
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Initialize SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef(null);

  if (SpeechRecognition) {
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false; // Stop after one sentence
    recognition.current.interimResults = false; // Only final results
    recognition.current.lang = "en-US"; // Default language

    // Handle recognition results
    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript); // Set the converted text to the input field
      setIsListening(false);
    };

    // Handle errors
    recognition.current.onerror = (event) => {
      console.error("Error occurred in recognition:", event.error);
      setIsListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };
  }

  // Start/stop voice recognition
  const toggleVoiceRecognition = () => {
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        isVoiceMessage: isListening, // Indicate if it's a voice message
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Mic Button for Voice-to-Text */}
          <button
            type="button"
            className={`btn btn-circle ${
              isListening ? "text-red-500" : "text-zinc-400"
            }`}
            onClick={toggleVoiceRecognition}
          >
            <Mic size={20} />
          </button>

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;