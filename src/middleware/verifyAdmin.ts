const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }

  next();
};

module.exports = verifyAdmin;
