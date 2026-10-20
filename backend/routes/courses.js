const router = require('express').Router();
const Course = require('../models/Course');

// GET /api/courses/search?q=  — must be BEFORE /:id to avoid conflict
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const regex = new RegExp(q, 'i');
  const courses = await Course.find({
    $or: [{ title: regex }, { code: regex }, { instructor: regex }]
  })
    .select('slug code title instructor color category')
    .populate('category', 'name slug')
    .lean();

  res.json(courses);
});

// GET /api/courses  — paginated list
router.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip  = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find({})
      .select('slug code title instructor color category')
      .populate('category', 'name slug')
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments({})
  ]);

  res.json({ courses, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/courses/:id  — full course detail with topics
router.get('/:id', async (req, res) => {
  // Support lookup by slug OR mongo _id
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const course = await Course.findOne(query)
    .populate('category', 'name slug')
    .lean();

  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

module.exports = router;
