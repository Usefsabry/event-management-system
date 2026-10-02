const { body, param, query } = require('express-validator');

// Register for event validation
const registerForEventValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Cancel registration validation
const cancelRegistrationValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
];

// Get event registrations validation
const getEventRegistrationsValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),

  query('status')
    .optional()
    .isIn(['all', 'confirmed', 'cancelled', 'waitlist', 'attended', 'no-show'])
    .withMessage('Invalid status value'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Get registration status validation
const getRegistrationStatusValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID')
];

// Update registration status validation
const updateRegistrationStatusValidation = [
  param('registrationId')
    .isMongoId()
    .withMessage('Invalid registration ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['confirmed', 'cancelled', 'waitlist', 'attended', 'no-show'])
    .withMessage('Status must be confirmed, cancelled, waitlist, attended, or no-show')
];

// Get my registrations query validation
const getMyRegistrationsValidation = [
  query('status')
    .optional()
    .isIn(['all', 'confirmed', 'cancelled', 'waitlist', 'attended', 'no-show'])
    .withMessage('Invalid status value'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('Upcoming must be a boolean value')
];

module.exports = {
  registerForEventValidation,
  cancelRegistrationValidation,
  getEventRegistrationsValidation,
  getRegistrationStatusValidation,
  updateRegistrationStatusValidation,
  getMyRegistrationsValidation
};