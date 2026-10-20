const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies the Bearer JWT from the Authorization header.
 * Attaches decoded payload as req.user on success.
 */
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
