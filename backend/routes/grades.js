const router = require('express').Router();
const auth   = require('../middleware/auth');
const Grade  = require('../models/Grade');

// GET /api/grades/me  (protected)
router.get('/me', auth, async (req, res) => {
  const grades = await Grade.find({ user: req.user.userId })
    .populate('course', 'slug code title color')
    .lean();
  res.json(grades);
});

module.exports = router;
