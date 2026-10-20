const router = require('express').Router();
const auth   = require('../middleware/auth');
const User   = require('../models/User');

// GET /api/users/me  (protected)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId)
    .select('-passwordHash')
    .populate('enrolledCourses', 'slug code title color instructor');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// PUT /api/users/me  (protected)
router.put('/me', auth, async (req, res) => {
  const allowed = ['name', 'department', 'avatar'];
  const updates = {};
  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-passwordHash')
    .populate('enrolledCourses', 'slug code title color instructor');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
