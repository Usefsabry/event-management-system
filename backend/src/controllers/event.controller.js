const Event = require('../models/Event');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Authenticated users)
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      location,
      capacity,
      category,
      startTime,
      endTime,
      price = 0,
      isPaid = false,
      tags = [],
      registrationDeadline,
      isRegistrationOpen = true
    } = req.body || {};

    // Verify category exists and is active
    const existingCategory = await Category.findById(category);
    if (!existingCategory || !existingCategory.isActive) {
      return next(new ApiError('Invalid or inactive category', 400));
    }

    // Create new event
    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      category,
      startTime,
      endTime,
      price,
      isPaid: price > 0 ? true : isPaid,
      tags,
      registrationDeadline,
      isRegistrationOpen,
      createdBy: req.user.userId
    });

    // Populate category and createdBy
    await event.populate([
      { path: 'category', select: 'name description slug' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with advanced filtering and pagination
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'active',
      sortBy = 'date',
      sortOrder = 'asc',
      startDate,
      endDate,
      location,
      isPaid,
      minPrice,
      maxPrice,
      upcoming,
      available
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by status
    if (status !== 'all') {
      filter.status = status;
    }

    // Search in title, description, location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Filter by payment type
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    // Filter upcoming events only
    if (upcoming === 'true') {
      filter.date = { ...filter.date, $gte: new Date() };
    }

    // Filter available events (not full)
    if (available === 'true') {
      filter.$expr = { $lt: ['$currentRegistrations', '$capacity'] };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('category', 'name description slug')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.json({
      success: true,
      message: 'Events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents: total,
          limit: parseInt(limit),
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          search: search || null,
          category: category || null,
          status,
          location: location || null,
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null
          },
          priceRange: {
            minPrice: minPrice || null,
            maxPrice: maxPrice || null
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID or slug
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let event;

    // Check if it's a MongoDB ObjectId or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      event = await Event.findById(id)
        .populate('category', 'name description slug')
        .populate('createdBy', 'name email');
    } else {
      // It's a slug
      event = await Event.findBySlug(id);
    }

    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    res.json({
      success: true,
      message: 'Event retrieved successfully',
      data: {
        event
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update event
 * @route   PATCH /api/events/:id
 * @access  Private (Event creator only)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    // Check ownership
    if (event.createdBy.toString() !== req.user.userId.toString()) {
      return next(new ApiError('Not authorized to update this event', 403));
    }

    // Validate category if being updated
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category || !category.isActive) {
        return next(new ApiError('Invalid or inactive category', 400));
      }
    }

    // Validate capacity if being updated
    if (updateData.capacity !== undefined && updateData.capacity < event.currentRegistrations) {
      return next(new ApiError(`Cannot reduce capacity below current registrations (${event.currentRegistrations})`, 400));
    }

    // Update isPaid based on price if price is being updated
    if (updateData.price !== undefined) {
      updateData.isPaid = updateData.price > 0;
    }

    // Update event
    Object.assign(event, updateData);
    await event.save();

    // Populate fields
    await event.populate([
      { path: 'category', select: 'name description slug' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event (only if no registrations)
 * @route   DELETE /api/events/:id
 * @access  Private (Event creator only)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return next(new ApiError('Event not found', 404));
    }

    // Check ownership
    if (event.createdBy.toString() !== req.user.userId.toString()) {
      return next(new ApiError('Not authorized to delete this event', 403));
    }

    // Check if event has registrations
    if (event.currentRegistrations > 0) {
      return next(new ApiError('Cannot delete event with existing registrations. Cancel the event instead.', 400));
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: {
        deletedEvent: {
          _id: event._id,
          title: event.title,
          date: event.date
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get upcoming events (simplified endpoint)
 * @route   GET /api/events/upcoming
 * @access  Public
 */
const getUpcomingEvents = async (req, res, next) => {
  try {
    const { limit = 10, category } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }
    
    const events = await Event.findUpcoming(filter).limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Upcoming events retrieved successfully',
      data: {
        events: events.map(event => ({
          _id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          category: event.category,
          availableSpots: event.availableSpots,
          slug: event.slug
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get events by category
 * @route   GET /api/events/category/:categoryId
 * @access  Public
 */
const getEventsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10 } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    const events = await Event.findByCategory(categoryId).limit(parseInt(limit));

    res.json({
      success: true,
      message: `Events in ${category.name} category retrieved successfully`,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug
        },
        events
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's events (events created by the authenticated user)
 * @route   GET /api/events/my-events
 * @access  Private
 */
const getMyEvents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { createdBy: req.user.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('category', 'name description slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Your events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents: total,
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

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByCategory,
  getMyEvents
};