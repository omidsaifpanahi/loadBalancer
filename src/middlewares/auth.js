// file_path: middlewares/auth.js

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = requireAuth;