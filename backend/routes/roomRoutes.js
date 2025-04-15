const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching rooms for user:', req.user.email);
    
    // Show all rooms to everyone
    const rooms = await Room.find().lean();
    console.log('Raw rooms from database:', rooms);
    console.log('Number of rooms found:', rooms.length);
    
    // Log each room's details
    rooms.forEach(room => {
      console.log('Room:', {
        id: room._id,
        name: room.name,
        isActive: room.isActive
      });
    });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a room
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating room for user:', req.user.email);
    const { name, capacity, location, description } = req.body;
    
    // Create room with creator info
    const room = await Room.create({
      name,
      capacity: parseInt(capacity),
      location: location || 'Main Building',
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      isActive: true
    });

    console.log('Room created successfully:', room._id);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a room
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, capacity, location, description } = req.body;
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        name,
        capacity: parseInt(capacity),
        location: location || 'Main Building',
        description,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a room
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
