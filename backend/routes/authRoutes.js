const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'room_scheduler_secret_key_2024';

// Register a user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    console.log('Received role:', req.body.role);
    
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate role
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be either "user" or "admin"' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with specified role
    const userData = { 
      name, 
      email: email.toLowerCase(), 
      password,
      role: role || 'user' // Use provided role or default to user
    };
    
    console.log('Creating user with data:', userData);
    const user = await User.createWithRole(userData);
    
    console.log('User created successfully:', email, 'with role:', user.role);

    // Generate token with user's actual role
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role // Use role from database
      },
      process.env.JWT_SECRET || 'room_scheduler_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Return actual role from database
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Login failed: User not found -', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password -', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token with user's actual role from database
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role // Use role from database
      },
      process.env.JWT_SECRET || 'room_scheduler_secret_key_2024',
      { expiresIn: '24h' }
    );

    console.log('Login successful:', email);

    // Return the role from the database
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role // Return actual role from database
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
