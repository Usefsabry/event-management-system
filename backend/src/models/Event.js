const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minLength: [5, 'Event title must be at least 5 characters'],
    maxLength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minLength: [20, 'Event description must be at least 20 characters'],
    maxLength: [2000, 'Event description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    minLength: [5, 'Location must be at least 5 characters'],
    maxLength: [200, 'Location cannot exceed 200 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10000, 'Capacity cannot exceed 10,000'],
    validate: {
      validator: Number.isInteger,
      message: 'Capacity must be a whole number'
    }
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: [0, 'Current registrations cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Event category is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'cancelled', 'completed', 'draft'],
      message: 'Status must be active, cancelled, completed, or draft'
    },
    default: 'active'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Additional fields for better event management
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Event timing
  startTime: {
    type: String, // Format: "HH:MM"
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  // Registration settings
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= this.date;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
eventSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      + '-' + Date.now(); // Add timestamp to ensure uniqueness
  }
});

// Validate start time is before end time
eventSchema.pre('save', function() {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      throw new Error('Start time must be before end time');
    }
  }
});

// Indexes for better performance
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ location: 'text', title: 'text', description: 'text' });

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.currentRegistrations;
});

// Virtual for is full
eventSchema.virtual('isFull').get(function() {
  return this.currentRegistrations >= this.capacity;
});

// Virtual for registration status
eventSchema.virtual('canRegister').get(function() {
  const now = new Date();
  const registrationDeadline = this.registrationDeadline || this.date;
  
  return this.status === 'active' && 
         this.isRegistrationOpen && 
         !this.isFull && 
         now < registrationDeadline;
});

// Virtual for is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.date;
});

// Virtual for is past
eventSchema.virtual('isPast').get(function() {
  return new Date() > this.date;
});

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(filters = {}) {
  return this.find({
    date: { $gte: new Date() },
    status: 'active',
    ...filters
  }).populate('category createdBy', 'name email');
};

// Static method to find by category
eventSchema.statics.findByCategory = function(categoryId) {
  return this.find({ 
    category: categoryId, 
    status: 'active',
    date: { $gte: new Date() }
  }).populate('category createdBy', 'name email');
};

// Static method to find by slug
eventSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: { $ne: 'draft' } })
    .populate('category', 'name description slug')
    .populate('createdBy', 'name email');
};

// Instance method to check if user can register
eventSchema.methods.canUserRegister = function() {
  return this.canRegister;
};

// Instance method to increment registrations
eventSchema.methods.incrementRegistrations = function() {
  if (this.currentRegistrations >= this.capacity) {
    throw new Error('Event is already at full capacity');
  }
  this.currentRegistrations += 1;
  return this.save();
};

// Instance method to decrement registrations
eventSchema.methods.decrementRegistrations = function() {
  if (this.currentRegistrations > 0) {
    this.currentRegistrations -= 1;
    return this.save();
  }
  return this;
};

// Instance method to cancel event
eventSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  // You might want to add a cancellation reason field
  return this.save();
};

// Instance method to complete event
eventSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);