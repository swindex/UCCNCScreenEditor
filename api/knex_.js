// knex.js
const knex = require('knex');
const knexConfig = require('./knexfile');
require('dotenv').config();


const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

module.exports = db;
