const knex = require("../knex_");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userRoles = require('../types/userRoles');
const validate = require('../validate');
const Joi = require('joi');

router.post('/register', async (req, res) => {
    const { username, password, first_name, last_name } = req.body;
  
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!validate(req.body, res, {
      username: Joi.string().required().min(5).max(50),
      password: Joi.string().required().min(5).max(50),
      first_name: Joi.string().required().min(2).max(50),
      last_name: Joi.string().required().min(2).max(50)
    })) return

    try {
      await knex('users').insert({
        username: username,
        password: hashedPassword,
        first_name: first_name,
        last_name: last_name,
        role_id: userRoles.user
      });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
});
  
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!validate(req.body, res, {
      username: Joi.string().required().max(50),
      password: Joi.string().required().max(50),
    })) return

    try {
        const user = await knex('users').where({ username }).first();

        if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({
          username: user.username,
          id: user.id,
          role_id: user.role_id,
          first_name: user.first_name,
          last_name: user.last_name,
        }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
          token: token,
          username: user.username,
          id: user.id,
          role_id: user.role_id,
          first_name: user.first_name,
          last_name: user.last_name,
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/check_token', authMiddleware, async (req, res) => {
  res.json({ token:req.token, ...req.decoded_user});
});

module.exports = router