const express = require('express');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  getRegistrationStatus,
  updateRegistrationStatus
} = require('../controllers/registration.controller');

const {
  registerForEventValidation,
  cancelRegistrationValidation,
  getEventRegistrationsValidation,
  getRegistrationStatusValidation,
  updateRegistrationStatusValidation,
  getMyRegistrationsValidation
} = require('../validations/registration.validation');

const { handleValidation } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/registrations/my-registrations
 * @desc    Get user's registrations
 * @access  Private
 */
router.get('/my-registrations', 
  authenticate, 
  getMyRegistrationsValidation, 
  handleValidation, 
  getMyRegistrations
);

/**
 * @route   PATCH /api/registrations/:registrationId
 * @desc    Update registration status (for event owners)
 * @access  Private (Event owner only)
 */
router.patch('/:registrationId', 
  authenticate, 
  updateRegistrationStatusValidation, 
  handleValidation, 
  updateRegistrationStatus
);

module.exports = router;