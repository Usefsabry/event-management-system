const { body, param } = require('express-validator');

// Create category validation rules
const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s&-]+$/)
    .withMessage('Category name can only contain letters, spaces, hyphens and ampersands'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Update category validation rules
const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s&-]+$/)
    .withMessage('Category name can only contain letters, spaces, hyphens and ampersands'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get category by ID validation
const getCategoryValidation = [
  param('id')
    .custom((value) => {
      // Check if it's a MongoDB ObjectId or a valid slug
      if (value.match(/^[0-9a-fA-F]{24}$/)) {
        return true; // Valid ObjectId
      }
      if (value.match(/^[a-z0-9-]+$/)) {
        return true; // Valid slug format
      }
      throw new Error('Invalid category ID or slug');
    })
];

// Delete category validation
const deleteCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID')
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryValidation,
  deleteCategoryValidation
};