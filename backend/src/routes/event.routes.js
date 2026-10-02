const express = require('express');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByCategory,
  getMyEvents
} = require('../controllers/event.controller');

const {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
  getRegistrationStatus
} = require('../controllers/registration.controller');

const {
  createEventValidation,
  updateEventValidation,
  getEventValidation,
  deleteEventValidation,
  getEventsQueryValidation
} = require('../validations/event.validation');

const {
  registerForEventValidation,
  cancelRegistrationValidation,
  getEventRegistrationsValidation,
  getRegistrationStatusValidation
} = require('../validations/registration.validation');

const { handleValidation } = require('../middleware/validation.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events (simplified)
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /api/events/my-events
 * @desc    Get user's events
 * @access  Private
 */
router.get('/my-events', authenticate, getMyEvents);

/**
 * @route   GET /api/events/category/:categoryId
 * @desc    Get events by category
 * @access  Public
 */
router.get('/category/:categoryId', getEventsByCategory);

/**
 * @route   GET /api/events
 * @desc    Get all events with advanced filtering and pagination
 * @access  Public
 */
router.get('/', getEventsQueryValidation, handleValidation, getEvents);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Authenticated users)
 */
router.post('/', authenticate, createEventValidation, handleValidation, createEvent);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID or slug
 * @access  Public
 */
router.get('/:id', getEventValidation, handleValidation, getEvent);

/**
 * @route   PATCH /api/events/:id
 * @desc    Update event
 * @access  Private (Event creator only)
 */
router.patch('/:id', authenticate, updateEventValidation, handleValidation, updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Event creator only)
 */
router.delete('/:id', authenticate, deleteEventValidation, handleValidation, deleteEvent);

// Registration-related routes for events

/**
 * @route   POST /api/events/:eventId/register
 * @desc    Register for an event
 * @access  Private
 */
router.post('/:eventId/register', 
  authenticate, 
  registerForEventValidation, 
  handleValidation, 
  registerForEvent
);

/**
 * @route   DELETE /api/events/:eventId/register
 * @desc    Cancel registration for an event
 * @access  Private
 */
router.delete('/:eventId/register', 
  authenticate, 
  cancelRegistrationValidation, 
  handleValidation, 
  cancelRegistration
);

/**
 * @route   GET /api/events/:eventId/registrations
 * @desc    Get event registrations (for event owners)
 * @access  Private (Event owner only)
 */
router.get('/:eventId/registrations', 
  authenticate, 
  getEventRegistrationsValidation, 
  handleValidation, 
  getEventRegistrations
);

/**
 * @route   GET /api/events/:eventId/registration-status
 * @desc    Check user registration status for an event
 * @access  Private
 */
router.get('/:eventId/registration-status', 
  authenticate, 
  getRegistrationStatusValidation, 
  handleValidation, 
  getRegistrationStatus
);

module.exports = router;