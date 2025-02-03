import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import drimoLogo from "../context/drimo/drimo.png";  // Import the image from the src folder

const AppContext = createContext();

const API_KEY = "ac97b4a45bf9f7f94d8d960d16fc3a36";
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

  const buttonRef = useRef(null);  // Ref for the draggable button
  const isDragging = useRef(false);  // Track dragging state
  const initialPosition = useRef({ x: 0, y: 0 });  // Store initial mouse position
  const buttonPosition = useRef({ x: 20, y: 20 });  // Initial button position

  // Function to handle the start of dragging
  const onMouseDown = (e) => {
    isDragging.current = true;
    initialPosition.current = {
      x: e.clientX - buttonPosition.current.x,
      y: e.clientY - buttonPosition.current.y
    };
  };

  // Function to handle dragging
  const onMouseMove = (e) => {
    if (isDragging.current) {
      buttonPosition.current = {
        x: e.clientX - initialPosition.current.x,
        y: e.clientY - initialPosition.current.y
      };
      buttonRef.current.style.left = `${buttonPosition.current.x}px`;
      buttonRef.current.style.top = `${buttonPosition.current.y}px`;
    }
  };

  // Function to stop dragging
  const onMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    // Add event listeners for dragging
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    
    return () => {
      // Clean up event listeners when the component unmounts
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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

  const handleButtonClick = () => {
    console.log("Logo clicked!");
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
          ref={buttonRef}
          src={drimoLogo}  // Use the imported image
          alt="Logo"
          onMouseDown={onMouseDown}
          onClick={handleButtonClick}
          style={styles.logo}
        />
        {children}
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
    position: 'fixed',  // Use fixed position to keep it at the top-right even after refresh
    top: '130px',  // Move the logo lower by adjusting this value
    right: '20px',  // Keep the logo aligned to the right
    maxWidth: '10%',   // Ensure the logo fits within the screen width
    maxHeight: '10%',  // Ensure the logo fits within the screen height
    width: 'auto',      // Maintains aspect ratio
    height: 'auto',     // Maintains aspect ratio
    cursor: 'pointer',
    objectFit: 'contain', // Ensures that the image is contained within its box without distortion
  },
};

export function useAppContext() {
  return useContext(AppContext);
}

export default AppProvider;
