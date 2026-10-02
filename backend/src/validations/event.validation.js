const { body, param, query } = require('express-validator');

// Create event validation rules
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Event description must be between 20 and 2000 characters'),

  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be in valid ISO 8601 format')
    .custom((value) => {
      const eventDate = new Date(value);
      const now = new Date();
      if (eventDate <= now) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Event location is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),

  body('capacity')
    .notEmpty()
    .withMessage('Event capacity is required')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be a whole number between 1 and 10,000'),

  body('category')
    .notEmpty()
    .withMessage('Event category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
    .custom((endTime, { req }) => {
      if (req.body.startTime) {
        const [startHour, startMin] = req.body.startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (startMinutes >= endMinutes) {
          throw new Error('End time must be after start time');
        }
      }
      return true;
    }),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid must be a boolean value'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 30)) {
        throw new Error('Each tag must be a string with maximum 30 characters');
      }
      return true;
    }),

  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be in valid ISO 8601 format')
    .custom((deadline, { req }) => {
      if (deadline && req.body.date) {
        const deadlineDate = new Date(deadline);
        const eventDate = new Date(req.body.date);
        if (deadlineDate > eventDate) {
          throw new Error('Registration deadline must be before event date');
        }
      }
      return true;
    }),

  body('isRegistrationOpen')
    .optional()
    .isBoolean()
    .withMessage('isRegistrationOpen must be a boolean value')
];

// Update event validation rules
const updateEventValidation = [
  param('id')
    .custom((value) => {
      // Check if it's a MongoDB ObjectId or a valid slug
      if (value.match(/^[0-9a-fA-F]{24}$/)) {
        return true; // Valid ObjectId
      }
      if (value.match(/^[a-z0-9-]+$/)) {
        return true; // Valid slug format
      }
      throw new Error('Invalid event ID or slug');
    }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event title cannot be empty')
    .isLength({ min: 5, max: 100 })
    .withMessage('Event title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event description cannot be empty')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Event description must be between 20 and 2000 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Event date must be in valid ISO 8601 format')
    .custom((value) => {
      if (value) {
        const eventDate = new Date(value);
        const now = new Date();
        if (eventDate <= now) {
          throw new Error('Event date must be in the future');
        }
      }
      return true;
    }),

  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event location cannot be empty')
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be a whole number between 1 and 10,000'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'completed', 'draft'])
    .withMessage('Status must be active, cancelled, completed, or draft'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid must be a boolean value'),

  body('isRegistrationOpen')
    .optional()
    .isBoolean()
    .withMessage('isRegistrationOpen must be a boolean value')
];

// Get event validation
const getEventValidation = [
  param('id')
    .custom((value) => {
      // Check if it's a MongoDB ObjectId or a valid slug
      if (value.match(/^[0-9a-fA-F]{24}$/)) {
        return true; // Valid ObjectId
      }
      if (value.match(/^[a-z0-9-]+$/)) {
        return true; // Valid slug format
      }
      throw new Error('Invalid event ID or slug');
    })
];

// Delete event validation
const deleteEventValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID')
];

// Query validation for getting events
const getEventsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  query('status')
    .optional()
    .isIn(['active', 'cancelled', 'completed', 'draft'])
    .withMessage('Invalid status value'),

  query('sortBy')
    .optional()
    .isIn(['title', 'date', 'createdAt', 'capacity', 'currentRegistrations'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO 8601 format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO 8601 format'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
];

module.exports = {
  createEventValidation,
  updateEventValidation,
  getEventValidation,
  deleteEventValidation,
  getEventsQueryValidation
};