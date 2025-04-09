const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: "API endpoint is working!",
    timestamp: new Date().toISOString()
  });
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 