const userRoles = require('./../types/userRoles');
const utils = require('./../utils');

require('dotenv').config();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Check if admin user exists

  await knex('users').delete();
  
  if (process.env.NODE_ENV != "test") {
    await knex.raw('ALTER TABLE users AUTO_INCREMENT = 1');
  }

  // Insert admin user
  await knex('users').insert({
    username: 'admin',
    password: await utils.hashPassword(process.env.DEFAULT_ADMIN_PASS),
    first_name:"Eldar",
    last_name:"Gerfanov",
    role_id: userRoles.admin
  });

  const users = [
    { username: 'john.doe@testemail.com', password: await utils.hashPassword('password123'), first_name: 'John', last_name: 'Doe', role_id: 2 },
    { username: 'jane.smith@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Jane', last_name: 'Smith', role_id: 2 },
    { username: 'michael.jones@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Michael', last_name: 'Jones', role_id: 2 },
    { username: 'emily.davis@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Emily', last_name: 'Davis', role_id: 2 },
    { username: 'william.brown@testemail.com', password: await utils.hashPassword('password123'), first_name: 'William', last_name: 'Brown', role_id: 2 },
    { username: 'olivia.johnson@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Olivia', last_name: 'Johnson', role_id: 2 },
    { username: 'daniel.wilson@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Daniel', last_name: 'Wilson', role_id: 2 },
    { username: 'sophia.moore@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Sophia', last_name: 'Moore', role_id: 2 },
    { username: 'james.taylor@testemail.com', password: await utils.hashPassword('password123'), first_name: 'James', last_name: 'Taylor', role_id: 2 },
    { username: 'ava.anderson@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Ava', last_name: 'Anderson', role_id: 2 },
    { username: 'logan.thomas@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Logan', last_name: 'Thomas', role_id: 2 },
    { username: 'isabella.jackson@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Isabella', last_name: 'Jackson', role_id: 2 },
    { username: 'lucas.white@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Lucas', last_name: 'White', role_id: 2 },
    { username: 'mia.harris@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Mia', last_name: 'Harris', role_id: 2 },
    { username: 'ethan.martin@testemail.com', password: await utils.hashPassword('password123'), first_name: 'Ethan', last_name: 'Martin', role_id: 2 },
  ];

  // Insert the users into the 'users' table
  
  await knex('users').insert(users);
};