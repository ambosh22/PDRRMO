import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import drimoLogo from "../context/drimo/drimo.png";  // Import the image from the src folder
import { sendMessageToOpenAI } from "./openaiService";  // Import the OpenAI service

const AppContext = createContext();

const API_KEY = "ac97b4a45bf9f7f94d8d960d16fc3a36";  // Your OpenWeather API key
const DEFAULT_LATITUDE = 30.0626;
const DEFAULT_LONGITUDE = 31.2497;

async function fetchData(url, setter) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    setter(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const AppProvider = ({ children }) => {
  const [latitude, setLatitude] = useState(DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(DEFAULT_LONGITUDE);
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [query, setQuery] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // State for handling messages
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  const fetchWeatherData = useCallback(() => {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    fetchData(currentWeatherUrl, setCurrentWeatherData);
    fetchData(forecastUrl, setForecastData);
  }, [latitude, longitude]);

  const fetchGeoData = useCallback(() => {
    if (query) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
      fetchData(geoUrl, setSearchResults);
    }
  }, [query]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    fetchGeoData();
  }, [fetchGeoData]);

  const handleLogoClick = async () => {
    setIsChatbotVisible(prevState => !prevState);
    if (!isChatbotVisible) {
      const chatbotResponse = await sendMessageToOpenAI("Hello, how can I assist you?");
      setMessages([...messages, { sender: "bot", text: chatbotResponse }]);
    }
  };

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (userInput.trim()) {
      const newMessages = [...messages, { sender: "user", text: userInput }];
      setMessages(newMessages);
      setUserInput("");

      // Add a placeholder message for the chatbot (thinking message)
      setMessages([...newMessages, { sender: "bot", text: "Thinking..." }]);

      // Get chatbot response from the backend
      const chatbotResponse = await sendMessageToOpenAI(userInput);
      setMessages([...newMessages, { sender: "bot", text: chatbotResponse }]);
    }
  };

  const value = {
    setLatitude,
    setLongitude,
    currentWeatherData,
    forecastData,
    setQuery,
    searchResults,
    setSearchResults,
    query,
  };

  return (
    <AppContext.Provider value={value}>
      <div style={styles.appContainer}>
        <img
          src={drimoLogo}  // Use the imported image
          alt="Logo"
          onClick={handleLogoClick}
          style={styles.logo}
        />
        {children}

        {/* Conditionally render the chatbot */}
        {isChatbotVisible && (
          <div style={styles.chatbotContainer}>
            <div style={styles.chatbotHeader}>
              <h4>Chatbot</h4>
              <button onClick={() => setIsChatbotVisible(false)} style={styles.closeButton}>X</button>
            </div>
            <div style={styles.chatbotMessages}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={msg.sender === "bot" ? styles.botMessage : styles.userMessage}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              style={styles.chatInput}
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

const styles = {
  appContainer: {
    position: 'relative',
    minHeight: '100vh',
  },
  logo: {
    position: 'fixed',  // Fixed position to keep it at the bottom-right of the screen
    bottom: '20px',     // Distance from the bottom of the screen
    right: '20px',      // Distance from the right side of the screen
    maxWidth: '10%',     // Ensure the logo fits within the screen width
    maxHeight: '10%',    // Ensure the logo fits within the screen height
    width: 'auto',       // Maintains aspect ratio
    height: 'auto',      // Maintains aspect ratio
    cursor: 'pointer',
    objectFit: 'contain', // Ensures that the image is contained within its box without distortion
  },
  chatbotContainer: {
    position: 'fixed',
    bottom: '100px', // Space from the bottom of the screen
    right: '20px', // Space from the right
    width: '300px',
    height: '400px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  chatbotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  chatbotMessages: {
    flexGrow: 1,
    overflowY: 'auto',
    marginBottom: '10px',
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
  },
  userMessage: {
    backgroundColor: '#0084ff',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
    alignSelf: 'flex-end',
  },
  chatInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    fontSize: '14px',
  },
  sendButton: {
    backgroundColor: '#0084ff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;