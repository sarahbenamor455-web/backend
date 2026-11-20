const requireAuth = (req, res, next) => {
  req.user = { id: 1, role: 'alumni' };
  next();
};

module.exports = { requireAuth };