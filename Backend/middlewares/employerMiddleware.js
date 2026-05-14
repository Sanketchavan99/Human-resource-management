const employerOnly = (req, res, next) => {
  // req.user is already set by authMiddleware
  if (req.user && req.user.role === 'employer') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Employer role required.' 
    });
  }
};

module.exports = employerOnly;
