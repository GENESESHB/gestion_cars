const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log('Token received:', token); // Log token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded token:', decoded); // Log decoded token

      req.user = await User.findById(decoded.id).select('-password');

      console.log('User found:', req.user); // Log user

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    if (!token) {
      console.error('No token found in authorization header');
    }
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
