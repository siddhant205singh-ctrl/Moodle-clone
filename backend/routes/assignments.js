const router = require('express').Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// GET /api/assignments/course/:courseId  — list all assignments for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .sort({ dueDate: 1 })
      .lean();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assignments/by-name/:courseId?title=...
// Finds or auto-creates an assignment by course + title (used when activity has no assignmentId)
router.get('/by-name/:courseId', async (req, res) => {
  try {
    const title = (req.query.title || '').trim();
    if (!title) return res.status(400).json({ message: 'title query param required' });

    let assignment = await Assignment.findOne({ course: req.params.courseId, title })
      .populate('course', 'slug title code instructor')
      .lean();

    if (!assignment) {
      const created = await Assignment.create({ course: req.params.courseId, title, description: '' });
      assignment = await Assignment.findById(created._id)
        .populate('course', 'slug title code instructor')
        .lean();
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/assignments/:id  — single assignment detail
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'slug title code instructor')
      .lean();
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/assignments  — create assignment (faculty/admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only faculty can create assignments' });
    }
    const { course, title, description, dueDate, maxScore } = req.body;
    const assignment = await Assignment.create({ course, title, description, dueDate, maxScore });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/assignments/:id  — update assignment (faculty/admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only faculty can edit assignments' });
    }
    const { title, description, dueDate, maxScore } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, maxScore },
      { new: true, runValidators: true }
    ).populate('course', 'slug title code instructor');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
