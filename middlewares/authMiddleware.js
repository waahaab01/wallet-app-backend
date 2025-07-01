const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { userId: ... }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token invalid' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};
