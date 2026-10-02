const Registration = require('../models/Registration');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Register user for an event
 * @route   POST /api/events/:eventId/register
 * @access  Private (Authenticated users)
 */
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const { notes } = req.body || {};

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    if (event.status !== 'active') {
      return next(new ApiError('Cannot register for inactive event', 400));
    }

    // Check if event is in the future
    if (new Date() >= new Date(event.date)) {
      return next(new ApiError('Cannot register for past events', 400));
    }

    // Check if registration is open
    if (!event.isRegistrationOpen) {
      return next(new ApiError('Registration is closed for this event', 400));
    }

    // Check registration deadline
    const registrationDeadline = event.registrationDeadline || event.date;
    if (new Date() >= new Date(registrationDeadline)) {
      return next(new ApiError('Registration deadline has passed', 400));
    }

    // Check if user is the event creator
    if (event.createdBy.toString() === userId.toString()) {
      return next(new ApiError('Event creators cannot register for their own events', 400));
    }

    // Check for any existing registration (including cancelled)
    const existingRegistration = await Registration.findOne({ user: userId, event: eventId });
    if (existingRegistration && ['confirmed', 'waitlist'].includes(existingRegistration.status)) {
      return next(new ApiError('You are already registered for this event', 409));
    }

    // Check capacity and determine registration status
    let registrationStatus = 'confirmed';
    if (event.currentRegistrations >= event.capacity) {
      return next(new ApiError('Event is at full capacity', 400));
      // Future enhancement: implement waitlist
      // registrationStatus = 'waitlist';
    }

    let registration;

    if (existingRegistration) {
      // Re-activate a previously cancelled registration instead of inserting a duplicate
      existingRegistration.status = registrationStatus;
      existingRegistration.registeredAt = new Date();
      existingRegistration.cancelledAt = null;
      existingRegistration.cancellationReason = null;
      if (notes) {
        existingRegistration.notes = notes;
      }
      await existingRegistration.save();
      registration = existingRegistration;
    } else {
      registration = await Registration.create({
        user: userId,
        event: eventId,
        status: registrationStatus,
        notes: notes || undefined
      });
    }

    // Populate user and event details
    await registration.populate([
      { path: 'user', select: 'name email' },
      { path: 'event', select: 'title date location capacity currentRegistrations price isPaid' }
    ]);

    res.status(201).json({
      success: true,
      message: registrationStatus === 'confirmed' 
        ? 'Successfully registered for event'
        : 'Added to event waitlist',
      data: {
        registration: {
          _id: registration._id,
          status: registration.status,
          registeredAt: registration.registeredAt,
          paymentStatus: registration.paymentStatus,
          paymentAmount: registration.paymentAmount,
          user: registration.user,
          event: registration.event,
          canCancel: registration.canCancel,
          daysUntilEvent: registration.daysUntilEvent
        }
      }
    });

  } catch (error) {
    // Handle duplicate registration error
    if (error.code === 11000) {
      return next(new ApiError('You are already registered for this event', 409));
    }
    next(error);
  }
};

/**
 * @desc    Cancel user registration for an event
 * @route   DELETE /api/events/:eventId/register
 * @access  Private (Authenticated users)
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body || {}; // Handle case when req.body is undefined

    // Find the registration
    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'waitlist'] }
    }).populate('event', 'title date location');

    if (!registration) {
      return next(new ApiError('Registration not found', 404));
    }

    // Check if cancellation is allowed
    if (!registration.canCancel) {
      return next(new ApiError('Cannot cancel registration less than 24 hours before the event', 400));
    }

    // Cancel the registration
    await registration.cancelRegistration(reason);

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: {
        registration: {
          _id: registration._id,
          status: registration.status,
          cancelledAt: registration.cancelledAt,
          cancellationReason: registration.cancellationReason,
          event: registration.event
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's registrations
 * @route   GET /api/registrations/my-registrations
 * @access  Private (Authenticated users)
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status = 'confirmed', page = 1, limit = 10, upcoming } = req.query;

    let registrations = await Registration.getUserRegistrations(userId, status);

    // Filter for upcoming events if requested
    if (upcoming === 'true') {
      const now = new Date();
      registrations = registrations.filter(reg => 
        reg.event && new Date(reg.event.date) > now
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = registrations.length;
    const paginatedRegistrations = registrations.slice(skip, skip + parseInt(limit));

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Your registrations retrieved successfully',
      data: {
        registrations: paginatedRegistrations.map(reg => ({
          _id: reg._id,
          status: reg.status,
          registeredAt: reg.registeredAt,
          paymentStatus: reg.paymentStatus,
          paymentAmount: reg.paymentAmount,
          canCancel: reg.canCancel,
          daysUntilEvent: reg.daysUntilEvent,
          event: reg.event,
          user: reg.user
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRegistrations: total,
          limit: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get event registrations (for event owners)
 * @route   GET /api/events/:eventId/registrations
 * @access  Private (Event owner only)
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status = 'confirmed', page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    // Check if event exists and user is the owner
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    if (event.createdBy.toString() !== userId.toString()) {
      return next(new ApiError('Not authorized to view registrations for this event', 403));
    }

    // Get registrations
    let registrations = await Registration.getEventRegistrations(eventId, status);

    // Apply pagination
    const skip = (page - 1) * limit;
    const total = registrations.length;
    const paginatedRegistrations = registrations.slice(skip, skip + parseInt(limit));

    const totalPages = Math.ceil(total / limit);

    // Get registration statistics
    const stats = {
      confirmed: await Registration.getRegistrationsCount(eventId, 'confirmed'),
      cancelled: await Registration.getRegistrationsCount(eventId, 'cancelled'),
      waitlist: await Registration.getRegistrationsCount(eventId, 'waitlist'),
      attended: await Registration.getRegistrationsCount(eventId, 'attended'),
      noShow: await Registration.getRegistrationsCount(eventId, 'no-show')
    };
    stats.total = stats.confirmed + stats.cancelled + stats.waitlist + stats.attended + stats.noShow;
    stats.availableSpots = event.capacity - stats.confirmed;

    res.json({
      success: true,
      message: 'Event registrations retrieved successfully',
      data: {
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          currentRegistrations: event.currentRegistrations
        },
        registrations: paginatedRegistrations.map(reg => ({
          _id: reg._id,
          status: reg.status,
          registeredAt: reg.registeredAt,
          paymentStatus: reg.paymentStatus,
          paymentAmount: reg.paymentAmount,
          notes: reg.notes,
          user: reg.user
        })),
        statistics: stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRegistrations: total,
          limit: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check user registration status for an event
 * @route   GET /api/events/:eventId/registration-status
 * @access  Private (Authenticated users)
 */
const getRegistrationStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    // Check if user is registered
    const registration = await Registration.isUserRegistered(userId, eventId);

    const registrationInfo = {
      isRegistered: !!registration,
      canRegister: event.canRegister && !registration && event.createdBy.toString() !== userId.toString(),
      registrationStatus: registration ? registration.status : null,
      registrationId: registration ? registration._id : null,
      canCancel: registration ? registration.canCancel : false,
      eventStatus: event.status,
      availableSpots: event.availableSpots,
      isFull: event.isFull,
      isEventOwner: event.createdBy.toString() === userId.toString()
    };

    res.json({
      success: true,
      message: 'Registration status retrieved successfully',
      data: {
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          currentRegistrations: event.currentRegistrations
        },
        registrationInfo
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update registration status (for event owners)
 * @route   PATCH /api/registrations/:registrationId
 * @access  Private (Event owner only)
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body || {};
    const userId = req.user.userId;

    // Find registration with event details
    const registration = await Registration.findById(registrationId)
      .populate('event', 'createdBy title')
      .populate('user', 'name email');

    if (!registration) {
      return next(new ApiError('Registration not found', 404));
    }

    // Check if user is the event owner
    if (registration.event.createdBy.toString() !== userId.toString()) {
      return next(new ApiError('Not authorized to update this registration', 403));
    }

    // Update status using instance methods
    switch (status) {
      case 'confirmed':
        await registration.confirmRegistration();
        break;
      case 'attended':
        await registration.markAttended();
        break;
      case 'no-show':
        await registration.markNoShow();
        break;
      case 'cancelled':
        await registration.cancelRegistration('Cancelled by event organizer');
        break;
      default:
        return next(new ApiError('Invalid status value', 400));
    }

    res.json({
      success: true,
      message: `Registration status updated to ${status}`,
      data: {
        registration: {
          _id: registration._id,
          status: registration.status,
          user: registration.user,
          event: registration.event
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  getRegistrationStatus,
  updateRegistrationStatus
};