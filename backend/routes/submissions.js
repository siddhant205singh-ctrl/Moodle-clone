const router = require('express').Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// GET /api/submissions/assignment/:assignmentId/all
// — faculty/admin: see ALL submissions for an assignment
router.get('/assignment/:assignmentId/all', auth, async (req, res) => {
  try {
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Faculty only' });
    }
    const subs = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name username studentId department')
      .populate('assignment', 'title dueDate maxScore')
      .sort({ updatedAt: -1 })
      .lean();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/submissions/:id/grade  — faculty grades a submission
router.patch('/:id/grade', auth, async (req, res) => {
  try {
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Faculty only' });
    }
    const { grade } = req.body;
    if (grade == null) return res.status(400).json({ message: 'grade is required' });
    const sub = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, gradedBy: req.user.userId, gradedAt: new Date() },
      { new: true }
    )
      .populate('student', 'name username studentId')
      .lean();
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions/assignment/:assignmentId/me
// — current student's own submission for an assignment
router.get('/assignment/:assignmentId/me', auth, async (req, res) => {
  try {
    const sub = await Submission.findOne({
      assignment: req.params.assignmentId,
      student:    req.user.userId,
    })
      .populate('assignment', 'title description dueDate maxScore course')
      .lean();
    res.json(sub || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/submissions  — submit / re-submit an assignment
// Body: { assignmentId, files: [{ originalName, mimeType, size, data }], comments }
router.post('/', auth, async (req, res) => {
  try {
    const { assignmentId, files, comments } = req.body;

    if (!assignmentId || !files || !files.length) {
      return res.status(400).json({ message: 'assignmentId and at least one file are required' });
    }

    // Upsert: update if exists, create otherwise
    const sub = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: req.user.userId },
      { files, comments, grade: null, gradedBy: null, gradedAt: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate('assignment', 'title description dueDate maxScore course')
      .lean();

    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/submissions/:id  — remove a submission (student can remove their own)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await sub.deleteOne();
    res.json({ message: 'Submission removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
