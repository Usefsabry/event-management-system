const express = require('express');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories
} = require('../controllers/category.controller');

const {
  createCategoryValidation,
  updateCategoryValidation,
  getCategoryValidation,
  deleteCategoryValidation
} = require('../validations/category.validation');

const { handleValidation } = require('../middleware/validation.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/categories/active
 * @desc    Get active categories (simplified)
 * @access  Public
 */
router.get('/active', getActiveCategories);

/**
 * @route   GET /api/categories
 * @desc    Get all categories with pagination and filtering
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Authenticated users)
 */
router.post('/', authenticate, createCategoryValidation, handleValidation, createCategory);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID or slug
 * @access  Public
 */
router.get('/:id', getCategoryValidation, handleValidation, getCategory);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update category
 * @access  Private (Category creator)
 */
router.patch('/:id', authenticate, updateCategoryValidation, handleValidation, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private (Category creator)
 */
router.delete('/:id', authenticate, deleteCategoryValidation, handleValidation, deleteCategory);

module.exports = router;