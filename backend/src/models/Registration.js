const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for registration']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required for registration']
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['confirmed', 'cancelled', 'waitlist', 'attended', 'no-show'],
      message: 'Status must be confirmed, cancelled, waitlist, attended, or no-show'
    },
    default: 'confirmed'
  },
  // Additional registration details
  registrationSource: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  // Payment information (if event is paid)
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'not_required'],
    default: 'not_required'
  },
  paymentAmount: {
    type: Number,
    min: [0, 'Payment amount cannot be negative'],
    default: 0
  },
  // Cancellation details
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxLength: [200, 'Cancellation reason cannot exceed 200 characters'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Additional indexes for performance
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ user: 1, status: 1 });
registrationSchema.index({ registeredAt: 1 });

// Virtual for registration duration (if event has ended)
registrationSchema.virtual('registrationDuration').get(function() {
  if (this.event && this.event.date) {
    const eventDate = new Date(this.event.date);
    const registrationDate = new Date(this.registeredAt);
    return eventDate - registrationDate;
  }
  return null;
});

// Virtual for days until event
registrationSchema.virtual('daysUntilEvent').get(function() {
  if (this.event && this.event.date) {
    const eventDate = new Date(this.event.date);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return null;
});

// Virtual for can cancel
registrationSchema.virtual('canCancel').get(function() {
  if (this.status !== 'confirmed') return false;
  
  // Can cancel if event is more than 24 hours away
  if (this.event && this.event.date) {
    const eventDate = new Date(this.event.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    return hoursUntilEvent > 24;
  }
  
  return false;
});

// Static method to check if user is already registered for event
registrationSchema.statics.isUserRegistered = function(userId, eventId) {
  return this.findOne({ 
    user: userId, 
    event: eventId, 
    status: { $in: ['confirmed', 'waitlist'] } 
  });
};

// Static method to get event registrations with user details
registrationSchema.statics.getEventRegistrations = function(eventId, status = 'confirmed') {
  const filter = { event: eventId };
  if (status !== 'all') {
    filter.status = status;
  }
  
  return this.find(filter)
    .populate('user', 'name email')
    .populate('event', 'title date location')
    .sort({ registeredAt: -1 });
};

// Static method to get user registrations with event details
registrationSchema.statics.getUserRegistrations = function(userId, status = 'confirmed') {
  const filter = { user: userId };
  if (status !== 'all') {
    filter.status = status;
  }
  
  return this.find(filter)
    .populate({
      path: 'event',
      select: 'title date startTime endTime location capacity currentRegistrations status slug price isPaid category',
      populate: {
        path: 'category',
        select: 'name _id'
      }
    })
    .populate('user', 'name email')
    .sort({ registeredAt: -1 });
};

// Static method to get registrations count by event
registrationSchema.statics.getRegistrationsCount = function(eventId, status = 'confirmed') {
  const filter = { event: eventId };
  if (status !== 'all') {
    filter.status = status;
  }
  
  return this.countDocuments(filter);
};

// Instance method to cancel registration
registrationSchema.methods.cancelRegistration = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

// Instance method to confirm registration (from waitlist)
registrationSchema.methods.confirmRegistration = function() {
  this.status = 'confirmed';
  return this.save();
};

// Instance method to mark as attended
registrationSchema.methods.markAttended = function() {
  this.status = 'attended';
  return this.save();
};

// Instance method to mark as no-show
registrationSchema.methods.markNoShow = function() {
  this.status = 'no-show';
  return this.save();
};

// Pre-save middleware to set payment amount based on event price
registrationSchema.pre('save', async function() {
  if (this.isNew && this.event) {
    // Populate event to get price information
    await this.populate('event');
    
    if (this.event.isPaid) {
      this.paymentAmount = this.event.price;
      this.paymentStatus = 'pending';
    } else {
      this.paymentAmount = 0;
      this.paymentStatus = 'not_required';
    }
  }
});

// Post-save middleware to update event registration count
registrationSchema.post('save', async function() {
  if (this.event) {
    const Event = mongoose.model('Event');
    const confirmedCount = await mongoose.model('Registration').countDocuments({
      event: this.event,
      status: 'confirmed'
    });
    
    await Event.findByIdAndUpdate(this.event, {
      currentRegistrations: confirmedCount
    });
  }
});

// Post-remove middleware to update event registration count
registrationSchema.post('remove', async function() {
  if (this.event) {
    const Event = mongoose.model('Event');
    const confirmedCount = await mongoose.model('Registration').countDocuments({
      event: this.event,
      status: 'confirmed'
    });
    
    await Event.findByIdAndUpdate(this.event, {
      currentRegistrations: confirmedCount
    });
  }
});

module.exports = mongoose.model('Registration', registrationSchema);