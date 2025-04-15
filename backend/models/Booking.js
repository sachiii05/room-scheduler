const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, status: 1 });

// Validate that endTime is after startTime
bookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Method to check for booking conflicts
bookingSchema.methods.hasConflict = async function() {
  const conflictingBooking = await this.constructor.findOne({
    room: this.room,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: this.endTime, $gte: this.startTime } },
      { endTime: { $gt: this.startTime, $lte: this.endTime } },
      {
        $and: [
          { startTime: { $lte: this.startTime } },
          { endTime: { $gte: this.endTime } }
        ]
      }
    ],
    _id: { $ne: this._id }
  });
  return !!conflictingBooking;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
