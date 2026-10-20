const router  = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

/* ── helpers ────────────────────────────────────────────────────────────────── */

function makeAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }           // short-lived
  );
}

function makeRefreshToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }            // long-lived
  );
}

function setRefreshCookie(res, refreshToken) {
  res.cookie('kiet_refresh', refreshToken, {
    httpOnly: true,                // JS cannot read it — XSS safe
    sameSite: 'Lax',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   7 * 24 * 60 * 60 * 1000   // 7 days in ms
  });
}

/* ── POST /api/auth/login ───────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = await User.findOne({ username: username.toLowerCase() })
    .populate('enrolledCourses', 'slug code title color instructor');

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken  = makeAccessToken(user);
  const refreshToken = makeRefreshToken(user);

  // Refresh token goes in an httpOnly cookie — never exposed to JS
  setRefreshCookie(res, refreshToken);

  res.json({
    accessToken,                   // short-lived, stored in memory (AuthContext)
    user: {
      _id:             user._id,
      username:        user.username,
      name:            user.name,
      role:            user.role,
      department:      user.department,
      studentId:       user.studentId,
      avatar:          user.avatar,
      enrolledCourses: user.enrolledCourses,
    }
  });
});

/* ── POST /api/auth/refresh ─────────────────────────────────────────────────── */
// Called by the frontend axios interceptor when a 401 is received.
// Reads the httpOnly refresh cookie, verifies it, issues a new access token.
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.kiet_refresh;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.userId).select('_id role').lean();
    if (!user) return res.status(401).json({ message: 'User not found' });

    const accessToken  = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);   // rotate refresh token

    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch {
    res.clearCookie('kiet_refresh');
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

/* ── POST /api/auth/logout ──────────────────────────────────────────────────── */
router.post('/logout', (_req, res) => {
  res.clearCookie('kiet_refresh');
  res.json({ message: 'Logged out' });
});

module.exports = router;
