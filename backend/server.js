const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Try to load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

// Fallback values if environment variables are not loaded
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@admin.dkezw.mongodb.net/?retryWrites=true&w=majority&appName=admin';
const PORT = process.env.PORT || 5001;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Connect to MongoDB
console.log('Connecting to MongoDB with URI:', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
