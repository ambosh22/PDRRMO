// sendMessagetoChatbot.jsx
import axios from "axios";

// Send message to backend (which will forward it to OpenAI)
export const sendMessageToChatbot = async (message) => {
  try {
    const response = await axios.post("http://localhost:5000/chat", {
      message: message,
    });

    // Log the response to check what the backend sends back
    console.log("Chatbot Response:", response.data);

    return response.data.reply || "Sorry, I couldn't generate a response. Please try again later.";
  } catch (error) {
    console.error("Error communicating with backend:", error.response || error.message);
    return "Sorry, I am having trouble fetching the response. Please try again later.";
  }
};
