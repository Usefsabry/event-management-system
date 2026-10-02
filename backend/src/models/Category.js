const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minLength: [2, 'Category name must be at least 2 characters'],
    maxLength: [50, 'Category name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s&-]+$/, 'Category name can only contain letters, spaces, hyphens and ampersands']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create slug before saving
categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdBy: 1 });

// Virtual for events count (will be useful later)
categorySchema.virtual('eventCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).populate('createdBy', 'name email');
};

// Static method to find by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true }).populate('createdBy', 'name email');
};

// Instance method to deactivate category
categorySchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to activate category
categorySchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);