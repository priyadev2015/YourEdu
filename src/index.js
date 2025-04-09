import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './utils/AuthContext'
import '@fontsource/ibm-plex-sans/400.css' // Regular
import '@fontsource/ibm-plex-sans/500.css' // Medium
import '@fontsource/ibm-plex-sans/600.css' // Semi-bold
import '@fontsource/ibm-plex-sans/700.css' // Bold
import { BrowserRouter } from 'react-router-dom'
import './styles/theme/css-variables.css' // Import CSS variables first

// Initialize the app
const initializeApp = async () => {
  try {
    console.log('Starting app initialization...');
    
    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('App initialization complete');
  } catch (error) {
    console.error('Error initializing app:', error);
    
    // Render the app anyway to avoid a blank screen
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
  }
};

// Start the initialization process
initializeApp();

// Add ResizeObserver error handler to suppress warnings -- this is not good code, I am commenting it out for now
// const resizeObserverError = new Event("error");
// window.addEventListener("error", (e) => {
//   if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
//     e.stopPropagation();
//     e.preventDefault();
//   }
// });
