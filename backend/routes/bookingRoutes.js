const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const emailService = require('../services/emailService');

// Get all bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('room', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's bookings
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', 'name location')
      .sort({ startTime: -1 }); // Sort by start time, newest first
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get room's bookings
router.get('/room/:roomId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ room: req.params.roomId })
      .populate('user', 'name email')
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check room availability
router.get('/availability/:roomId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const bookings = await Booking.find({
      room: req.params.roomId,
      date: new Date(date)
    });

    const available = room.capacity > bookings.length;
    res.json({
      available,
      capacity: room.capacity,
      booked: bookings.length,
      remaining: room.capacity - bookings.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending bookings (admin only)
router.get('/pending', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin access required' });
    }

    const bookings = await Booking.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('room', 'name location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve or reject booking (admin only)
router.put('/:id/approval', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin access required' });
    }

    const { status, rejectionReason } = req.body;
    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be confirmed or cancelled' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only approve/reject pending bookings' });
    }

    // Update booking status and add approval details
    booking.status = status;
    booking.approvedBy = req.user.id;
    booking.approvedAt = new Date();
    if (status === 'cancelled' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    // Save the booking
    const updatedBooking = await booking.save();

    // Send email notification to user
    const emailSent = await emailService.sendBookingStatusNotification(updatedBooking, status);
    if (!emailSent) {
      console.error('Failed to send booking status notification');
      // Don't fail the entire operation if email fails
    }

    res.json({
      success: true,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Booking approval error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message,
      error: err 
    });
  }
});

// Create a booking
router.post('/', auth, async (req, res) => {
  try {
    const { room, startTime, endTime, reason } = req.body;

    console.log('Received booking request:', { room, startTime, endTime });

    if (!room) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Check if room exists
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      room: roomDoc._id,
      startTime,
      endTime,
      reason,
      status: 'pending'
    });

    // Save booking
    const savedBooking = await booking.save();
    console.log('Created booking object:', booking);

    // Check for conflicts
    const hasConflict = await booking.hasConflict();
    if (hasConflict) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    // Send email notification to admin
    const emailSent = await emailService.sendBookingRequestNotification(booking);
    if (!emailSent) {
      console.error('Failed to send booking request notification to admin');
      // Don't fail the entire operation if email fails
    }

    const newBooking = await booking.save();
    console.log('Booking saved successfully:', newBooking);
    
    await newBooking.populate('room', 'name location');
    await newBooking.populate('user', 'name email');
    
    console.log('Booking created and populated:', newBooking);
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a booking
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (req.body.date) {
      booking.date = new Date(req.body.date);
    }

    const updatedBooking = await booking.save();
    await updatedBooking.populate('room', 'name location');
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow any authenticated user to cancel bookings
    // No additional authorization check needed

    // Use deleteOne instead of remove (which is deprecated)
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
