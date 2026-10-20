const router   = require('express').Router();
const Category = require('../models/Category');
const Course   = require('../models/Course');

// Build the nested tree from a flat list of categories
function buildTree(cats, parentId = null) {
  return cats
    .filter(c => String(c.parent) === String(parentId))
    .map(c => ({
      _id:         c._id,
      slug:        c.slug,
      name:        c.name,
      courseCount: c.courseCount,
      children:    buildTree(cats, c._id)
    }));
}

// GET /api/categories  — full nested tree
router.get('/', async (_req, res) => {
  const cats = await Category.find({}).lean();
  const tree = buildTree(cats, null);
  res.json(tree);
});

// GET /api/categories/:id  — single category with its courses
router.get('/:id', async (req, res) => {
  const cat = await Category.findById(req.params.id).lean();
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  // Get direct children categories
  const children = await Category.find({ parent: cat._id }).lean();

  // Get courses in this category
  const courses = await Course.find({ category: cat._id })
    .select('slug code title instructor color')
    .lean();

  res.json({ ...cat, children, courses });
});

module.exports = router;
