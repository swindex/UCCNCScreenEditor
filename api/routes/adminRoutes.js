const express = require('express');
const router = express.Router();
const knex = require('../knex_');
const validate = require('../validate');
const Joi = require('joi');
const { removeNulls, hashPassword } = require('./../utils');

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await knex('users').select('id', 'username', 'first_name', 'last_name', 'role_id', 'updated_at', 'created_at');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a single user by ID
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  if (!validate(req.params, res, {
    id: Joi.number().required().min(1),
  })) return

  try {
    const user = await knex('users').select('id', 'username', 'first_name', 'last_name', 'role_id', 'updated_at', 'created_at').where({ id }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/users', async (req, res) => {
  if (!validate(req.body, res, {
    username: Joi.string().required().min(5).max(50),
    password: Joi.string().required().min(5).max(50),
    first_name: Joi.string().required().min(2).max(50),
    last_name: Joi.string().required().min(2).max(50),
    role_id: Joi.number().required().min(1).max(3),
  })) return

  try {
    const user = await knex('users').select('id', 'username', 'first_name', 'last_name', 'role_id', 'updated_at', 'created_at').where({ username:req.body.username }).first();
    if (user) return res.status(405).json({ message: 'User already exists' });


    ret = await knex('users').insert({
      username: req.body.username,
      password: await hashPassword(req.body.password),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      role_id: req.body.role_id
    }).returning("id");

    res.status(201).json({ message: 'User created successfully', id: ret[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;

  if (!validate(req.body, res, {
    username: Joi.string().optional().min(5).max(50),
    password: Joi.string().optional().min(5).max(50),
    first_name: Joi.string().optional().min(2).max(50),
    last_name: Joi.string().optional().min(2).max(50),
    role_id: Joi.number().optional().min(1).max(3),
  })) return

  try {
    const user = await knex('users').where({ id }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.username=="admin") return res.status(405).json({ message: "Can't update the Admin" });

    if (req.body.username) {
      const user_existing = await knex('users').where({ username:req.body.username }).whereNot({ id }).first();
      if (user_existing) return res.status(405).json({ message: 'Username already used by another user' });
    }

    let put_request = removeNulls({
      username: req.body.username,
      password: req.body.password ? await hashPassword(req.body.password) : null,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      role_id: req.body.role_id,
    })
   
    await knex('users')
      .where({ id })
      .update(put_request);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await knex('users').where({ id }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.username=="admin") return res.status(405).json({ message: "Can't delete the Admin" });


    await knex('users').where({ id }).del();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
