const jwt = require('jsonwebtoken');

// Replace this with your secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the user to the request object
    req.decoded_user = decoded;
    req.token = token

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
