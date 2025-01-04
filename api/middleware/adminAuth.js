const jwt = require('jsonwebtoken');
const knex = require('../knex_');
const authMiddleware = require('./authMiddleware');
const roles = require('./../types/userRoles');

require('dotenv').config();

const adminAuth = async (req, res, next) => {
  // First, call the authMiddleware to authenticate the user
  await authMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the authenticated user is an admin
    if (req.decoded_user.role_id !== roles.admin) {
      return res.status(403).json({ error: 'Access forbidden: Admins only' });
    }

    // Proceed to the next middleware or route
    next();
  });
};

module.exports = adminAuth;
