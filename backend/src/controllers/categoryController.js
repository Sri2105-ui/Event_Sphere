import { Category } from '../models/Category.js';
import { Event } from '../models/Event.js';

// @desc Get all active categories with event counts
// @route GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Aggregate published event count per category
    const counts = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      eventCount: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create category (Admin only)
// @route POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, color, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name,
      slug,
      icon: icon || 'calendar',
      description: description || '',
      color: color || '#6366F1',
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update category (Admin only)
// @route PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete category (Admin only)
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Soft delete or remove
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
