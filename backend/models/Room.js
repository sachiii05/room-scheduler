const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true,
    default: 'Main Building'
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching
roomSchema.index({ name: 'text', location: 'text' });

// Middleware to update updatedAt timestamp
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check for time conflicts
roomSchema.methods.hasConflict = async function(booking) {
  const { startTime, endTime } = booking;
  const conflicts = await this.constructor.find({
    _id: this._id,
    bookings: {
      $elemMatch: {
        startTime: { $lte: endTime },
        endTime: { $gte: startTime }
      }
    }
  });
  return conflicts.length > 0;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
