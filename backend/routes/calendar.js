const router = require('express').Router();
const Event  = require('../models/Event');
const User   = require('../models/User');
const jwt    = require('jsonwebtoken');

// GET /api/calendar
// — If a valid JWT is present, returns only events for the user's enrolled courses.
// — Otherwise returns all events (used by public calendar page).
router.get('/', async (req, res) => {
  try {
    let courseFilter = null;

    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('enrolledCourses role').lean();
        if (user && user.enrolledCourses && user.enrolledCourses.length > 0) {
          // Students: filter to their enrolled courses only
          courseFilter = { course: { $in: user.enrolledCourses } };
        }
      } catch {
        // Invalid token — fall through to return all events
      }
    }

    const query = courseFilter || {};
    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate('course', 'slug title color')
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
