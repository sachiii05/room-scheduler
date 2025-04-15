const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Checking authorization for:', req.method, req.path);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token found, attempting to verify');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'room_scheduler_secret_key_2024');
      console.log('Token verified successfully. User ID:', decoded.userId);
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User authenticated:', { 
        id: user._id, 
        email: user.email,
        role: decoded.role // Use role from token
      });
      
      // Set user info with role from token
      req.user = {
        id: user._id,
        email: user.email,
        role: decoded.role // Use role from token
      };
      
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Error in auth middleware:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = auth;
