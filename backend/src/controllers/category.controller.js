const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Authenticated users)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body || {};

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive search
    });

    if (existingCategory) {
      return next(new ApiError('Category with this name already exists', 409));
    }

    // Create new category
    const category = await Category.create({
      name,
      description,
      createdBy: req.user.userId
    });

    // Populate createdBy field
    await category.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories with pagination and filtering
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCategories: total,
          limit: parseInt(limit),
          hasNextPage,
          hasPreviousPage
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    let category;

    // Check if it's a MongoDB ObjectId or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      category = await Category.findById(id).populate('createdBy', 'name email');
    } else {
      // It's a slug
      category = await Category.findBySlug(id);
    }

    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PATCH /api/categories/:id
 * @access  Private (Category creator or Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body || {};

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    // Check ownership (only creator can update)
    if (category.createdBy.toString() !== req.user.userId.toString()) {
      return next(new ApiError('Not authorized to update this category', 403));
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id } // Exclude current category
      });

      if (existingCategory) {
        return next(new ApiError('Category with this name already exists', 409));
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    await category.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (soft delete by setting isActive to false)
 * @route   DELETE /api/categories/:id
 * @access  Private (Category creator or Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return next(new ApiError('Category not found', 404));
    }

    // Check ownership (only creator can delete)
    if (category.createdBy.toString() !== req.user.userId.toString()) {
      return next(new ApiError('Not authorized to delete this category', 403));
    }

    // TODO: Check if category has events before deleting
    // For now, we'll just deactivate the category
    await category.deactivate();

    res.json({
      success: true,
      message: 'Category deactivated successfully',
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active categories (simplified endpoint)
 * @route   GET /api/categories/active
 * @access  Public
 */
const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.getActiveCategories();

    res.json({
      success: true,
      message: 'Active categories retrieved successfully',
      data: {
        categories: categories.map(category => ({
          _id: category._id,
          name: category.name,
          description: category.description,
          slug: category.slug
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories
};